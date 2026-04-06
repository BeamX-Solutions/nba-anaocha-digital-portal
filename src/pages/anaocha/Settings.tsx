import { useState, useEffect } from "react";
import { Lock, Bell, Eye, EyeOff, ShieldCheck, Users } from "lucide-react";
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

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

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
      setVisibility(visibility); // revert
    } else {
      toast({ title: "Privacy settings updated" });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast({ title: "Current password required", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    setPasswordLoading(true);

    // Verify current password by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? "",
      password: currentPassword,
    });

    if (signInError) {
      setPasswordLoading(false);
      toast({ title: "Current password is incorrect", variant: "destructive" });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);
    if (error) {
      toast({ title: "Failed to update password", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <DashboardLayout title="NBA Anaocha" sidebarItems={anaochaSidebarItems}>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account security and preferences.</p>
        </div>

        {/* Account Info */}
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="font-heading text-lg font-semibold text-foreground">Account</h2>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email address</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{user?.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="h-5 w-5 text-primary" />
              <h2 className="font-heading text-lg font-semibold text-foreground">Change Password</h2>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Current Password</label>
                <div className="relative mt-1">
                  <input
                    type={showCurrent ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Your current password"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">New Password</label>
                <div className="relative mt-1">
                  <input
                    type={showNew ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                <div className="relative mt-1">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Privacy / Directory Visibility */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="font-heading text-lg font-semibold text-foreground">Directory Visibility</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Control what other members can see when they find you in the member directory.
            </p>
            <div className="space-y-4">
              {[
                { key: "show_phone" as const, label: "Phone Number", desc: "Allow other members to see your phone number" },
                { key: "show_email" as const, label: "Email Address", desc: "Allow other members to see your email address" },
                { key: "show_office_address" as const, label: "Office Address", desc: "Allow other members to see your office address" },
              ].map(({ key, label, desc }) => (
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

        {/* Notification Preferences */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="font-heading text-lg font-semibold text-foreground">Notifications</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>You receive notifications through two channels:</p>
              <ul className="space-y-2 ml-4 list-disc">
                <li><span className="text-foreground font-medium">In-app:</span> visible via the bell icon and Notifications page</li>
                <li><span className="text-foreground font-medium">Email:</span> sent to <span className="text-foreground">{user?.email}</span></li>
              </ul>
              <p className="pt-1">Emails are sent automatically when your application is approved or rejected, and when your account status changes.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
