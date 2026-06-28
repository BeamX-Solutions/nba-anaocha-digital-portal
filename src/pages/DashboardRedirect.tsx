import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const DashboardRedirect = () => {
  const { user, loading, profileComplete, isAdmin } = useAuth();

  if (loading || (user && profileComplete === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;
  if (profileComplete === false) return <Navigate to="/complete-profile" replace />;

  if (isAdmin) return <Navigate to="/admin" replace />;
  return <Navigate to="/anaocha/dashboard" replace />;
};

export default DashboardRedirect;
