import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Protects admin routes. Two ways to grant admin access:
 *
 * OPTION 1 (easiest) — add the admin's email to .env:
 *   VITE_ADMIN_EMAILS="youremail@example.com,another@example.com"
 *   Then restart the dev server.
 *
 * OPTION 2 — Supabase Dashboard → Authentication → Users →
 *   select user → edit App Metadata → set: { "role": "admin" }
 */
const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;

  // Check env-variable admin list (OPTION 1)
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);

  const emailMatch = adminEmails.length > 0 && adminEmails.includes(user.email?.toLowerCase() ?? "");

  // Check Supabase app_metadata role (OPTION 2)
  const metaMatch = user.app_metadata?.role === "admin";

  if (!emailMatch && !metaMatch) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default AdminRoute;
