import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { PasswordRequirements } from "@/components/PasswordRequirements";
import { isPasswordValid } from "@/lib/password";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordOk = isPasswordValid(password);
  const passwordsMatch = password === confirmPassword;

  useEffect(() => {
    const isRecoveryLink = () => {
      const url = new URL(window.location.href);
      return url.hash.includes("type=recovery") || url.searchParams.get("type") === "recovery";
    };

    if (isRecoveryLink()) {
      setReady(true);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordOk) {
      toast({ title: "Password too weak", description: "Please meet all the password requirements.", variant: "destructive" });
      return;
    }
    if (!passwordsMatch) {
      toast({ title: "Passwords don't match", description: "Please re-enter the same password.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated!" });
      navigate("/signin");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center bg-muted/30 py-12 px-4">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="p-8">
            <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Set New Password</h1>
            {ready ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">New Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a strong password"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  <PasswordRequirements password={password} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="mt-1 text-xs text-destructive">Passwords don't match.</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading || !passwordOk || !passwordsMatch}>
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            ) : (
              <p className="text-muted-foreground">Invalid or expired reset link. Please request a new one.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
