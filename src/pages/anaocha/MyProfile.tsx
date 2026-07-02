import { useState, useEffect, useRef } from "react";
import { Save, Camera, Loader2, Clock, X, Mail } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { anaochaSidebarItems } from "@/lib/sidebarItems";
import { RANK_LABELS } from "@/lib/constants";

const FIELD_GROUPS = [
  {
    title: "Personal Information",
    fields: [
      { key: "first_name",  label: "First Name",  required: true, sensitive: true },
      { key: "surname",     label: "Surname",      required: true, sensitive: true },
      { key: "middle_name", label: "Middle Name", sensitive: true },
    ],
  },
  {
    title: "Bar Details",
    fields: [
      { key: "scn",          label: "Supreme Court Number (SCN)", sensitive: true },
      { key: "year_of_call", label: "Year of Call", sensitive: true },
      { key: "branch",       label: "NBA Branch", locked: true },
    ],
  },
  {
    title: "Contact",
    fields: [
      { key: "phone",          label: "Phone Number", required: true },
      { key: "office_address", label: "Office Address", multiline: true },
    ],
  },
];

// Identity fields: for approved members these save into a change request that
// the secretariat reviews, instead of applying immediately (enforced in the DB).
const ALL_FIELDS: any[] = FIELD_GROUPS.flatMap((g) => g.fields as any[]);
const SENSITIVE_KEYS: string[] = ALL_FIELDS.filter((f) => f.sensitive).map((f) => f.key);
const FIELD_LABELS: Record<string, string> = Object.fromEntries(ALL_FIELDS.map((f) => [f.key, f.label]));

const MyProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<string>("");
  const [rank, setRank] = useState<string>("regular");
  const [lbian, setLbian] = useState<string | null>(null);
  const [lbianPublic, setLbianPublic] = useState<boolean>(true);
  const [pendingRequest, setPendingRequest] = useState<any | null>(null);
  const [cancellingRequest, setCancellingRequest] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("id, first_name, middle_name, surname, scn, year_of_call, branch, phone, office_address, avatar_url, status, rank, lbian, lbian_public")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfileId(data.id);
          setApprovalStatus((data as any).status ?? "");
          setAvatarUrl((data as any).avatar_url ?? null);
          setRank((data as any).rank ?? "regular");
          setLbian((data as any).lbian ?? null);
          setLbianPublic((data as any).lbian_public ?? true);
          // rank/lbian are system/admin-managed and lbian_public is saved via its
          // own toggle — keep all three out of the editable profile so a member's
          // Save never tries to change them (the DB trigger would reject lbian/rank).
          const { id, avatar_url, status, rank, lbian, lbian_public, ...rest } = data as any;
          const values = Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, (v as any) ?? ""]));
          setProfile(values);
          setOriginal(values);
        }
        setLoading(false);
      });

    // Any change request still awaiting secretariat review?
    (supabase as any)
      .from("profile_change_requests")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .maybeSingle()
      .then(({ data }: any) => { if (data) setPendingRequest(data); });
  }, [user]);

  const cancelPendingRequest = async () => {
    if (!pendingRequest) return;
    setCancellingRequest(true);
    const { error } = await (supabase as any)
      .from("profile_change_requests")
      .delete()
      .eq("id", pendingRequest.id);
    setCancellingRequest(false);
    if (error) {
      toast({ title: "Couldn't withdraw request", description: error.message, variant: "destructive" });
      return;
    }
    setPendingRequest(null);
    toast({ title: "Change request withdrawn." });
  };

  const handleChangeEmail = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast({ title: "Enter a valid email address.", variant: "destructive" });
      return;
    }
    if (email === user?.email?.toLowerCase()) {
      toast({ title: "That is already your current email.", variant: "destructive" });
      return;
    }
    setChangingEmail(true);
    const { error } = await supabase.auth.updateUser({ email });
    setChangingEmail(false);
    if (error) {
      toast({ title: "Couldn't change email", description: error.message, variant: "destructive" });
      return;
    }
    setShowEmailForm(false);
    setNewEmail("");
    toast({
      title: "Confirmation link sent",
      description: `Check ${email} (and your current inbox) and click the link to complete the change.`,
    });
  };

  const handleChange = (key: string, value: string) =>
    setProfile((prev) => ({ ...prev, [key]: value }));

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum size is 2 MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const cacheBusted = `${publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", user.id);
    setUploading(false);
    setAvatarUrl(cacheBusted);
    toast({ title: "Profile photo updated." });
    e.target.value = "";
  };

  const updateLbianPublic = async (value: boolean) => {
    if (!profileId) return;
    setLbianPublic(value);
    const { error } = await (supabase as any).from("profiles").update({ lbian_public: value }).eq("id", profileId);
    if (error) {
      setLbianPublic(!value);
      toast({ title: "Couldn't update", description: error.message, variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!user || !profileId) return;
    if (!profile.first_name?.trim() || !profile.surname?.trim()) {
      toast({ title: "First name and surname are required.", variant: "destructive" });
      return;
    }
    setSaving(true);

    // Approved members: identity fields go through secretariat review.
    if (approvalStatus === "active") {
      const sensitiveChanges: Record<string, string> = {};
      const previous: Record<string, string> = {};
      for (const key of SENSITIVE_KEYS) {
        if ((profile[key] ?? "") !== (original[key] ?? "")) {
          sensitiveChanges[key] = profile[key] ?? "";
          previous[key] = original[key] ?? "";
        }
      }
      const directUpdate: Record<string, string> = {};
      for (const [key, value] of Object.entries(profile)) {
        if (!SENSITIVE_KEYS.includes(key) && value !== (original[key] ?? "")) {
          directUpdate[key] = value;
        }
      }

      if (Object.keys(sensitiveChanges).length > 0 && pendingRequest) {
        setSaving(false);
        toast({
          title: "A change request is already pending",
          description: "Withdraw the pending request before submitting new identity changes.",
          variant: "destructive",
        });
        return;
      }

      if (Object.keys(directUpdate).length > 0) {
        const { error } = await supabase.from("profiles").update(directUpdate).eq("id", profileId);
        if (error) {
          setSaving(false);
          toast({ title: "Failed to save", description: error.message, variant: "destructive" });
          return;
        }
        setOriginal((prev) => ({ ...prev, ...directUpdate }));
      }

      if (Object.keys(sensitiveChanges).length > 0) {
        const { data, error } = await (supabase as any)
          .from("profile_change_requests")
          .insert({ user_id: user.id, changes: sensitiveChanges, previous })
          .select()
          .single();
        setSaving(false);
        if (error) {
          toast({ title: "Couldn't submit change request", description: error.message, variant: "destructive" });
          return;
        }
        setPendingRequest(data);
        // Inputs show the on-record values; the banner shows what was requested.
        setProfile((prev) => ({ ...prev, ...previous }));
        toast({
          title: "Sent for approval",
          description: "Your identity changes were submitted to the secretariat for review. Other changes were saved.",
        });
        return;
      }

      setSaving(false);
      toast({ title: "Profile updated successfully." });
      return;
    }

    // Pending accounts still complete their profile directly.
    const { error } = await supabase.from("profiles").update(profile).eq("id", profileId);
    setSaving(false);
    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
      return;
    }
    setOriginal({ ...profile });
    toast({ title: "Profile updated successfully." });
  };

  const isActiveMember = approvalStatus === "active";
  const initials = [profile.first_name, profile.surname]
    .filter(Boolean).map((n) => n[0]).join("").toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";

  if (loading) {
    return (
      <DashboardLayout title="NBA Anaocha" sidebarItems={anaochaSidebarItems}>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="NBA Anaocha" sidebarItems={anaochaSidebarItems}>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your personal and professional information.</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Avatar + identity card */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={uploading}
                  className="group relative h-20 w-20 rounded-full overflow-hidden ring-2 ring-border focus:outline-none focus:ring-primary transition-all"
                  aria-label="Change profile photo"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">{initials}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploading ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p className="font-heading text-lg font-semibold text-foreground">
                  {[profile.first_name, profile.surname].filter(Boolean).join(" ") || "Your Name"}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <p className="text-sm text-muted-foreground">{profile.branch || "NBA Member"}</p>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={uploading}
                  className="text-xs text-primary hover:text-accent transition-colors mt-1 font-medium"
                >
                  {uploading ? "Uploading..." : avatarUrl ? "Change photo" : "Upload photo"}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending identity change request */}
        {pendingRequest && (
          <Card className="shadow-card border-amber-300 bg-amber-50/60">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-amber-900">Changes awaiting secretariat approval</h3>
              </div>
              <div className="space-y-1.5">
                {Object.entries(pendingRequest.changes || {}).map(([key, value]) => (
                  <p key={key} className="text-sm text-amber-900">
                    <span className="font-medium">{FIELD_LABELS[key] || key}:</span>{" "}
                    <span className="line-through opacity-60">{(pendingRequest.previous?.[key] as string) || "—"}</span>
                    {" → "}
                    <span className="font-semibold">{(value as string) || "—"}</span>
                  </p>
                ))}
              </div>
              <p className="text-xs text-amber-800/80">
                Submitted {new Date(pendingRequest.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}.
                You'll be notified once the secretariat reviews it.
              </p>
              <Button size="sm" variant="outline" className="gap-1 border-amber-400 text-amber-900 hover:bg-amber-100" onClick={cancelPendingRequest} disabled={cancellingRequest}>
                {cancellingRequest ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                Withdraw Request
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Field groups */}
        {FIELD_GROUPS.map((group) => (
          <Card key={group.title} className="shadow-card">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-3 pb-2 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.fields.map((field: any) => {
                  return (
                    <div key={field.key} className={field.multiline ? "md:col-span-2" : ""}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <label className="text-sm font-medium text-foreground">
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </label>
                        {field.sensitive && isActiveMember && (
                          <Badge variant="secondary" className="text-xs">Approval required</Badge>
                        )}
                      </div>
                      {(field as any).locked ? (
                        <div className="w-full rounded-md border border-border/40 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                          {(field as any).locked ? "Anaocha" : (profile[field.key] || <span className="italic opacity-50">Not set</span>)}
                        </div>
                      ) : field.multiline ? (
                        <textarea
                          value={profile[field.key] || ""}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          rows={3}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={profile[field.key] || ""}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* LBIAN — Lawyer Bar Identification Number */}
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-3">
            <h3 className="text-sm font-semibold text-foreground pb-2 border-b border-border">Bar Identification</h3>
            <div>
              <label className="text-sm font-medium text-foreground">LBIAN (Lawyer Bar Identification Number)</label>
              <div className="mt-1.5 w-full rounded-md border border-border/40 bg-muted/40 px-3 py-2 text-sm font-semibold tracking-wide text-foreground">
                {lbian || <span className="italic font-normal text-muted-foreground">Issued once your membership is approved</span>}
              </div>
            </div>
            {lbian && (
              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input type="checkbox" checked={lbianPublic} onChange={(e) => updateLbianPublic(e.target.checked)} className="h-4 w-4 rounded border-input" />
                <span className="text-sm text-foreground">Show my LBIAN in the member directory</span>
              </label>
            )}
            <p className="text-xs text-muted-foreground">Issued by the branch and used for services such as the customized plate number.</p>
          </CardContent>
        </Card>

        {/* Seniority (read-only, admin-managed) — only shown for SAN / Benchers */}
        {rank !== "regular" && (
          <Card className="shadow-card">
            <CardContent className="p-6 space-y-2">
              <h3 className="text-sm font-semibold text-foreground pb-2 border-b border-border">Seniority</h3>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border border-primary/30">{RANK_LABELS[rank] ?? rank}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Set by the branch secretariat. Determines your tiered dues, such as the Welfare Levy.</p>
            </CardContent>
          </Card>
        )}

        {/* Account email */}
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-3">
            <h3 className="text-sm font-semibold text-foreground pb-2 border-b border-border">Account</h3>
            <div>
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <div className="mt-1.5 w-full rounded-md border border-border/40 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                {user?.email}
              </div>
              {!showEmailForm ? (
                <button
                  type="button"
                  onClick={() => setShowEmailForm(true)}
                  className="text-xs text-primary hover:text-accent transition-colors mt-2 font-medium"
                >
                  Change email address
                </button>
              ) : (
                <div className="mt-3 space-y-2">
                  <label className="text-sm font-medium text-foreground">New Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="new.address@example.com"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleChangeEmail} disabled={changingEmail} className="gap-1.5">
                      {changingEmail ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                      Send Confirmation Link
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setShowEmailForm(false); setNewEmail(""); }} disabled={changingEmail}>
                      Cancel
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A confirmation link will be sent to the new address. Your login email changes only after you click it.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MyProfile;
