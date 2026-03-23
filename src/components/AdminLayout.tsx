import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ClipboardList, Users, FileText, Bell, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Applications", href: "/admin/applications", icon: <ClipboardList className="h-4 w-4" /> },
  { label: "Members", href: "/admin/members", icon: <Users className="h-4 w-4" /> },
  { label: "Documents", href: "/admin/documents", icon: <FileText className="h-4 w-4" /> },
  { label: "Send Notification", href: "/admin/notify", icon: <Bell className="h-4 w-4" /> },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 flex-col bg-primary text-primary-foreground flex flex-shrink-0">
        <div className="p-6 border-b border-primary-foreground/20">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <h2 className="font-heading text-lg font-bold text-accent">Admin Panel</h2>
          </div>
          <p className="text-xs text-primary-foreground/60 truncate">{user?.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-accent text-primary font-semibold"
                  : "text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-primary-foreground/20">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-primary-foreground/75 hover:text-primary-foreground hover:bg-primary-foreground/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-muted/30 overflow-auto">
        <div className="p-8 animate-fade-in">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
