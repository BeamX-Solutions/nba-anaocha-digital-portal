import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, CheckCircle, Users, Bell, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { anaochaSidebarItems } from "@/lib/sidebarItems";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const [visibility, setVisibility] = useState({
    show_phone: false,
    show_email: false,
    show_office_address: true,
  });
  const [visibilityLoading, setVisibilityLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("show_phone, show_email, show_office_address")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setVisibility({
          show_phone: data.show_phone ?? false,
          show_email: data.show_email ?? false,
          show_office_address: data.show_office_address ?? true,
        });
      });
  }, [user]);

  const handleVisibilityToggle = async (key: keyof typeof visibility) => {
    const updated = { ...visibility, [key]: !visibility[key] };
    setVisibility(updated);
    setVisibilityLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update(updated)
      .eq("user_id", user!.id);
    setVisibilityLoading(false);
    if (error) {
      toast({ title: "Failed to save visibility settings", variant: "destructive" });
      setVisibility(visibility);
    } else {
      toast({ title: "Privacy settings updated." });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!next.trim() || !confirm.trim()) {
      toast({ title: "All fields are required.", variant: "destructive" }); return;
    }
    if (next.length < 8) {
      toast({ title: "Password must be at least 8 characters.", variant: "destructive" }); return;
    }
    if (next !== confirm) {
      toast({ title: "Passwords do not match.", variant: "destructive" }); return;
    }
    setSaving(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? "",
      password: current,
    });
    if (signInError) {
      setSaving(false);
      toast({ title: "Current password is incorrect.", variant: "destructive" }); return;
    }
    const { error } = await supabase.auth.updateUser({ password: next });
    setSaving(false);
    if (error) {
      toast({ title: "Failed to update password", description: error.message, variant: "destructive" }); return;
    }
    setDone(true);
    setCurrent(""); setNext(""); setConfirm("");
    toast({ title: "Password updated successfully." });
    setTimeout(() => setDone(false), 4000);
  };

  const passwordFields = [
    { label: "Current Password", value: current, setter: setCurrent, show: showCurrent, toggle: setShowCurrent },
    { label: "New Password",     value: next,    setter: setNext,    show: showNext,    toggle: setShowNext },
    { label: "Confirm Password", value: confirm,  setter: setConfirm, show: showConfirm,  toggle: setShowConfirm },
  ];

  const visibilityOptions = [
    { key: "show_phone"          as const, label: "Phone Number",   desc: "Allow other members to see your phone number" },
    { key: "show_email"          as const, label: "Email Address",  desc: "Allow other members to see your email address" },
    { key: "show_office_address" as const, label: "Office Address", desc: "Allow other members to see your office address" },
  ];

  return (
    <DashboardLayout title="NBA Anaocha" sidebarItems={anaochaSidebarItems}>
      <div className="space-y-6 max-w-lg">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account security and preferences.</p>
        </div>

        {/* Change Password */}
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3 pb-2 border-b border-border">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-heading text-base font-semibold text-foreground">Change Password</h2>
            </div>

            {done ? (
              <div className="flex items-center gap-3 py-4">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <p className="text-sm text-foreground">Password updated successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordFields.map((f, i) => (
                  <div key={i}>
                    <label className="text-sm font-medium text-foreground">{f.label}</label>
                    <div className="relative mt-1.5">
                      <input
                        type={f.show ? "text" : "password"}
                        value={f.value}
                        onChange={(e) => f.setter(e.target.value)}
                        required
                        className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        type="button"
                        aria-label={f.show ? "Hide" : "Show"}
                        onClick={() => f.toggle(!f.show)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {f.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  {saving ? "Updating..." : "Update Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Directory Visibility */}
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3 pb-2 border-b border-border">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">Directory Visibility</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Control what other members see when they find you.</p>
              </div>
            </div>
            <div className="space-y-4">
              {visibilityOptions.map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <button
                    onClick={() => handleVisibilityToggle(key)}
                    disabled={visibilityLoading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      visibility[key] ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        visibility[key] ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-border">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-heading text-base font-semibold text-foreground">Notifications</h2>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>You receive notifications through two channels:</p>
              <ul className="space-y-1.5 ml-4 list-disc">
                <li><span className="text-foreground font-medium">In-app</span>: visible via the bell icon and Notifications page.</li>
                <li><span className="text-foreground font-medium">Email</span>: sent to <span className="text-foreground">{user?.email}</span>.</li>
              </ul>
              <p className="pt-1">Emails are sent automatically when your application status changes or your account is updated.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
