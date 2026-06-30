import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SidebarItem {
  label: string;
  href: string;
  icon: ReactNode;
  external?: boolean;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  sidebarItems: SidebarItem[];
}

const DashboardLayout = ({ children, title, sidebarItems }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSignOutConfirm = async () => {
    setMobileOpen(false);
    await signOut();
    navigate("/");
  };

  const SidebarContent = () => (
    <>
      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) =>
          item.external ? (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:translate-x-0.5"
              )}
            >
              {item.icon}
              {item.label}
            </a>
          ) : (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                location.pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-primary translate-x-0.5 shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:translate-x-0.5"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        )}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => setConfirmOpen(true)}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  const mobileMenuButton = (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setMobileOpen((o) => !o)}
      className="h-10 w-10 text-primary-foreground hover:bg-primary-foreground/10"
      aria-label="Toggle menu"
      aria-expanded={mobileOpen}
    >
      {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </Button>
  );

  const mobileMenuPanel = mobileOpen ? (
    <div className="bg-sidebar text-sidebar-foreground border-t border-sidebar-border shadow-lg max-h-[70vh] overflow-y-auto">
      <SidebarContent />
    </div>
  ) : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header mobileMenuButton={mobileMenuButton} mobileMenuPanel={mobileMenuPanel} />
      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border overflow-y-auto">
          <SidebarContent />
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-muted/30 overflow-y-auto">
          <div className="p-6 lg:p-8 animate-fade-in">{children}</div>
        </main>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of your NBA Anaocha account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOutConfirm} className="bg-destructive hover:bg-destructive/90">
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardLayout;
