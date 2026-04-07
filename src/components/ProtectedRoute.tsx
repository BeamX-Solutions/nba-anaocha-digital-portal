import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Clock } from "lucide-react";
import nbaLogo from "@/assets/nba-logo.png";

const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "").split(",").map((e: string) => e.trim().toLowerCase());

const PendingApproval = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
    <div className="max-w-md w-full text-center space-y-6">
      <img src={nbaLogo} alt="NBA Anaocha" className="h-16 w-16 mx-auto" />
      <div className="bg-card border border-border rounded-xl p-8 shadow-card space-y-4">
        <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
          <Clock className="h-7 w-7 text-amber-600" />
        </div>
        <h1 className="font-heading text-xl font-bold text-foreground">Account Pending Approval</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Your account is awaiting approval by the NBA Anaocha secretariat. You will be notified once your account has been activated.
        </p>
        <p className="text-xs text-muted-foreground">
          For enquiries, contact{" "}
          <a href="mailto:support@nbaanaocha.org.ng" className="text-primary hover:underline">
            support@nbaanaocha.org.ng
          </a>
        </p>
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profileComplete, profileStatus } = useAuth();

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

  return <>{children}</>;
};

export default ProtectedRoute;
