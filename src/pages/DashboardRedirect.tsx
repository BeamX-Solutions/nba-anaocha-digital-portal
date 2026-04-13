import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getAdminRole } from "@/components/AdminRoute";

const DashboardRedirect = () => {
  const { user, loading, profileComplete, portalAccess, refreshProfile } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user || loading || portalAccess === null) return;

    const pending = localStorage.getItem("pending_portal_access");
    if (!pending) { setDone(true); return; }

    // Apply the portal_access the user chose at sign-in/sign-up (works for both email and Google OAuth)
    setSyncing(true);
    supabase
      .from("profiles")
      .update({ portal_access: pending })
      .eq("user_id", user.id)
      .then(async () => {
        localStorage.removeItem("pending_portal_access");
        await refreshProfile();
        setSyncing(false);
        setDone(true);
      });
  }, [user, loading, portalAccess]);

  if (loading || syncing || (user && (portalAccess === null || profileComplete === null || !done))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;
  if (profileComplete === false) return <Navigate to="/complete-profile" replace />;

  const email = user.email?.toLowerCase() ?? "";
  if (getAdminRole(email)) return <Navigate to="/admin" replace />;
  if (portalAccess === "remuneration") return <Navigate to="/remuneration/dashboard" replace />;
  return <Navigate to="/anaocha/dashboard" replace />;
};

export default DashboardRedirect;
