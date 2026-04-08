import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { Users, Scale, ArrowRight } from "lucide-react";
import nbaLogo from "@/assets/nba-logo.png";
import { useAuth } from "@/contexts/AuthContext";

const portalOptions = [
  {
    value: "anaocha",
    icon: <Users className="h-6 w-6" />,
    title: "NBA Anaocha Member",
    description: "You are a member of the Nigerian Bar Association, Anaocha Branch. Access branch services, member directory, and the Remuneration Portal.",
  },
  {
    value: "remuneration",
    icon: <Scale className="h-6 w-6" />,
    title: "NBA Member — Remuneration Portal",
    description: "You are an NBA member from another branch. Access the Remuneration Portal to prepare and manage legal documents.",
  },
];

const SignUp = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<"portal" | "account">("portal");

  if (user) return <Navigate to="/dashboard" replace />;
  const [portalAccess, setPortalAccess] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePortalSelect = (value: string) => {
    setPortalAccess(value);
    setStep("account");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalAccess) return;
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { portal_access: portalAccess },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: "Account created!",
      description: "Please check your email to verify your account, then sign in.",
    });
    navigate("/signin");
  };

  const handleGoogle = async () => {
    if (!portalAccess) return;
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: { portal_access: portalAccess },
      },
    });
    if (error) {
      setGoogleLoading(false);
      toast({ title: "Google sign up failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center bg-muted/30 py-12 px-4">

        {step === "portal" ? (
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <img src={nbaLogo} alt="NBA Anaocha" className="h-14 w-14 mx-auto mb-4" />
              <h1 className="font-heading text-2xl font-bold text-foreground">Create Account</h1>
              <p className="text-muted-foreground mt-1">Which portal are you registering for?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portalOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handlePortalSelect(opt.value)}
                  className="text-left bg-card border-2 border-border rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all group"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {opt.icon}
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-2">{opt.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{opt.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
                    Select <ArrowRight className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/signin" className="text-primary font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        ) : (
          <Card className="w-full max-w-md shadow-card">
            <CardContent className="p-8">
              <button
                onClick={() => setStep("portal")}
                className="text-xs text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
              >
                ← Back
              </button>
              <h1 className="font-heading text-2xl font-bold text-foreground mb-1">Create Account</h1>
              <p className="text-sm text-muted-foreground mb-6">
                {portalAccess === "anaocha" ? "NBA Anaocha Branch Member" : "NBA Member — Remuneration Portal"}
              </p>

              <form onSubmit={handleSignUp} className="space-y-4">
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
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    minLength={8}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Sign Up"}
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

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/signin" className="text-primary font-semibold hover:underline">Sign In</Link>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SignUp;
