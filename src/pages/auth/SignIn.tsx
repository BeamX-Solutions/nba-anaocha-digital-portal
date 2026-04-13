import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Scale, ArrowLeft, Eye, EyeOff } from "lucide-react";

const portalOptions = [
  {
    value: "anaocha",
    icon: <Users className="h-6 w-6" />,
    title: "NBA Anaocha Member",
    description: "Sign in to access branch services, member directory, and the Remuneration Portal.",
  },
  {
    value: "remuneration",
    icon: <Scale className="h-6 w-6" />,
    title: "NBA Member — Remuneration Portal",
    description: "Sign in as an NBA member from another branch to access the Remuneration Portal.",
  },
];

const SignIn = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<"portal" | "credentials">("portal");
  const [portalAccess, setPortalAccess] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  if (user) return <Navigate to="/dashboard" replace />;

  const handlePortalSelect = (value: string) => {
    setPortalAccess(value);
    setStep("credentials");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalAccess) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      return;
    }
    // Store portal selection so DashboardRedirect can update profile if needed
    localStorage.setItem("pending_portal_access", portalAccess);
    navigate("/dashboard");
  };

  const handleGoogle = async () => {
    if (!portalAccess) return;
    setGoogleLoading(true);
    localStorage.setItem("pending_portal_access", portalAccess);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      setGoogleLoading(false);
      localStorage.removeItem("pending_portal_access");
      toast({ title: "Google sign in failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center bg-muted/30 py-12 px-4">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="p-8">

            {/* Step 1: Portal selection */}
            {step === "portal" && (
              <>
                <h1 className="font-heading text-2xl font-bold text-foreground mb-1">Sign In</h1>
                <p className="text-sm text-muted-foreground mb-6">Which portal are you signing into?</p>
                <div className="space-y-3">
                  {portalOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handlePortalSelect(opt.value)}
                      className="w-full text-left border border-border rounded-xl p-4 hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-muted-foreground group-hover:text-primary transition-colors mt-0.5">
                          {opt.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{opt.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{opt.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary font-semibold hover:underline">Sign Up</Link>
                </p>
              </>
            )}

            {/* Step 2: Credentials */}
            {step === "credentials" && (
              <>
                <button
                  onClick={() => setStep("portal")}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <h1 className="font-heading text-2xl font-bold text-foreground mb-1">
                  {portalAccess === "remuneration" ? "Remuneration Portal" : "NBA Anaocha Portal"}
                </h1>
                <p className="text-sm text-muted-foreground mb-6">Enter your credentials to continue</p>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <div className="relative mt-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs text-muted-foreground">
                    <span className="bg-card px-2">or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  onClick={handleGoogle}
                  disabled={googleLoading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {googleLoading ? "Redirecting..." : "Continue with Google"}
                </Button>

                <div className="mt-4 text-center text-sm text-muted-foreground space-y-2">
                  <p>
                    <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
                  </p>
                  <p>
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-primary font-semibold hover:underline">Sign Up</Link>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
