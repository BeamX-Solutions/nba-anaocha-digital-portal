import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, profileComplete, isAdmin } = useAuth();

  // Wait for both the session and the profile (which carries is_admin) to load,
  // otherwise a real admin would briefly be redirected away before is_admin resolves.
  if (loading || (user && profileComplete === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default AdminRoute;
