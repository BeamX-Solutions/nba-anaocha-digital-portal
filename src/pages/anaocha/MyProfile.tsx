import { useState, useEffect, useRef } from "react";
import { Save, Camera, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { anaochaSidebarItems } from "@/lib/sidebarItems";

const FIELD_GROUPS = [
  {
    title: "Personal Information",
    fields: [
      { key: "first_name",  label: "First Name",  required: true },
      { key: "surname",     label: "Surname",      required: true },
      { key: "middle_name", label: "Middle Name" },
    ],
  },
  {
    title: "Bar Details",
    fields: [
      { key: "scn",          label: "Supreme Court Number (SCN)", verifiedLock: true },
      { key: "year_of_call", label: "Year of Call" },
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

const MyProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("id, first_name, middle_name, surname, scn, year_of_call, branch, phone, office_address, avatar_url, status")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfileId(data.id);
          setApprovalStatus((data as any).status ?? "");
          setAvatarUrl((data as any).avatar_url ?? null);
          const { id, avatar_url, status, ...rest } = data as any;
          setProfile(Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, (v as any) ?? ""])));
        }
        setLoading(false);
      });
  }, [user]);

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

  const handleSave = async () => {
    if (!user || !profileId) return;
    if (!profile.first_name?.trim() || !profile.surname?.trim()) {
      toast({ title: "First name and surname are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").update(profile).eq("id", profileId);
    setSaving(false);
    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Profile updated successfully." });
  };

  const isScnLocked = approvalStatus === "active";
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

        {/* Field groups */}
        {FIELD_GROUPS.map((group) => (
          <Card key={group.title} className="shadow-card">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-3 pb-2 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.fields.map((field: any) => {
                  const isLocked = field.verifiedLock && isScnLocked;
                  return (
                    <div key={field.key} className={field.multiline ? "md:col-span-2" : ""}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <label className="text-sm font-medium text-foreground">
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </label>
                        {isLocked && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      {(isLocked || (field as any).locked) ? (
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

        {/* Email (read-only) */}
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-3">
            <h3 className="text-sm font-semibold text-foreground pb-2 border-b border-border">Account</h3>
            <div>
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <div className="mt-1.5 w-full rounded-md border border-border/40 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                {user?.email}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed. Contact the secretariat if needed.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MyProfile;
