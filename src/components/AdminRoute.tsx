import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const superAdminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",").map((e: string) => e.trim().toLowerCase()).filter(Boolean);

export const anaochaAdminEmails = (import.meta.env.VITE_ANAOCHA_ADMIN_EMAILS || "")
  .split(",").map((e: string) => e.trim().toLowerCase()).filter(Boolean);

export const isSuperAdmin = (email: string) => superAdminEmails.includes(email.toLowerCase());
export const isAnaochaAdmin = (email: string) => anaochaAdminEmails.includes(email.toLowerCase());

export const getAdminRole = (email: string): "super" | "anaocha" | null => {
  if (isSuperAdmin(email)) return "super";
  if (isAnaochaAdmin(email)) return "anaocha";
  return null;
};

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

  const email = user.email?.toLowerCase() ?? "";
  const metaMatch = user.app_metadata?.role === "admin";

  if (!getAdminRole(email) && !metaMatch) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
