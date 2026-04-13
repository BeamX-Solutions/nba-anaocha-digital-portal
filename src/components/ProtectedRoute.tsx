import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, LogOut } from "lucide-react";
import nbaLogo from "@/assets/nba-logo.png";
import { Button } from "@/components/ui/button";

const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "").split(",").map((e: string) => e.trim().toLowerCase());

const PendingApproval = () => {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <img src={nbaLogo} alt="NBA Anaocha" className="h-8 w-8" />
          <span className="font-heading font-bold text-foreground text-sm">NBA Anaocha</span>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-card border border-border rounded-2xl shadow-card w-full max-w-lg overflow-hidden">

          {/* Top accent line */}
          <div className="h-1 w-full bg-primary" />

          <div className="px-10 py-12 text-center space-y-6">
            {/* Logo */}
            <img src={nbaLogo} alt="NBA Anaocha" className="h-14 w-14 mx-auto opacity-80" />

            {/* Label */}
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                Nigerian Bar Association
              </p>
              <p className="text-sm italic text-muted-foreground">Anaocha Branch</p>
            </div>

            {/* Heading */}
            <div className="space-y-3">
              <h1 className="font-heading text-4xl font-bold text-foreground leading-tight">
                Account Pending<br />Approval
              </h1>
              <div className="w-10 h-px bg-accent mx-auto" />
            </div>

            {/* Body */}
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
              Your application for membership is currently being reviewed by the Branch Secretariat. We maintain a high standard of professional verification to preserve the integrity of our digital archive.
            </p>

            {/* Status box */}
            <div className="bg-muted rounded-lg px-5 py-4 text-left flex items-start gap-3">
              <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-foreground mb-1">Verification Status</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Typical processing time is 2–3 business days. You will receive a notification once your access is granted.
                </p>
              </div>
            </div>

            {/* Contact row */}
            <div className="grid grid-cols-2 gap-4 text-left pt-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Support Desk</p>
                <a href="mailto:support@nbaanaocha.org.ng" className="text-sm text-foreground hover:text-primary transition-colors">
                  support@nbaanaocha.org.ng
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Inquiry Line</p>
                <p className="text-sm text-foreground">secretariat@nbaanaocha.org.ng</p>
              </div>
            </div>

            {/* Sign out */}
            <Button onClick={signOut} className="w-full mt-2">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>

          {/* Footer */}
          <div className="border-t border-border px-10 py-4 text-center">
            <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
              Institutional Integrity &bull; Legal Excellence &bull; Legacy
            </p>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="px-6 py-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} NBA Anaocha Branch. All rights reserved.</p>
        <a href="mailto:support@nbaanaocha.org.ng" className="text-xs text-muted-foreground hover:text-foreground">Contact Support</a>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, portalGuard }: { children: React.ReactNode; portalGuard?: "anaocha" }) => {
  const { user, loading, profileComplete, profileStatus, portalAccess } = useAuth();

  if (loading || (user && profileComplete === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;

  if (profileComplete === false) return <Navigate to="/complete-profile" replace />;

  // Admins are always approved
  const isAdmin = adminEmails.includes(user.email?.toLowerCase() ?? "");
  if (!isAdmin && profileStatus === "pending") return <PendingApproval />;

  // Remuneration-only users cannot access Anaocha portal routes
  if (portalGuard === "anaocha" && portalAccess === "remuneration") {
    return <Navigate to="/remuneration/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
