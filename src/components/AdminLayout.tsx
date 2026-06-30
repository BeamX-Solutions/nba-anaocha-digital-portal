import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ClipboardList, Users, Bell, LogOut, Mail, Menu, Megaphone, BookMarked, ScrollText, TrendingUp, Landmark, UserCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import nbaLogo from "@/assets/nba-logo.png";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const sidebarItems = [
  { label: "Dashboard",         href: "/admin",                icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Anaocha Members",   href: "/admin/members",        icon: <Users className="h-4 w-4" /> },
  { label: "Applications",      href: "/admin/applications",   icon: <ClipboardList className="h-4 w-4" /> },
  { label: "Dues",              href: "/admin/dues",           icon: <Landmark className="h-4 w-4" /> },
  { label: "Contact Messages",  href: "/admin/contacts",       icon: <Mail className="h-4 w-4" /> },
  { label: "Announcements",     href: "/admin/announcements",  icon: <Megaphone className="h-4 w-4" /> },
  { label: "Resources",         href: "/admin/resources",      icon: <BookMarked className="h-4 w-4" /> },
  { label: "Leadership",        href: "/admin/leadership",     icon: <UserCircle className="h-4 w-4" /> },
  { label: "Send Notification", href: "/admin/notify",         icon: <Bell className="h-4 w-4" /> },
  { label: "Reporting",         href: "/admin/reporting",      icon: <TrendingUp className="h-4 w-4" /> },
  { label: "Audit Logs",        href: "/admin/audit-logs",     icon: <ScrollText className="h-4 w-4" /> },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSignOutConfirm = async () => {
    await signOut();
    navigate("/");
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-primary-foreground/20">
        <div className="flex items-center gap-2 mb-1">
          <img src={nbaLogo} alt="NBA Anaocha Logo" className="h-8 w-8 rounded-md" />
          <h2 className="font-heading text-lg font-bold text-accent">Admin Panel</h2>
        </div>
        <p className="text-xs text-primary-foreground/60 truncate">{user?.email}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setMobileOpen(false)}
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

      <div className="p-4 border-t border-primary-foreground/20 space-y-1">
        <Link
          to="/anaocha/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Portal
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-primary-foreground/75 hover:text-primary-foreground hover:bg-primary-foreground/10"
          onClick={() => setConfirmOpen(true)}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-primary text-primary-foreground flex-shrink-0 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-muted/30 overflow-auto min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground sticky top-0 z-40">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-primary-foreground hover:bg-primary-foreground/10 flex-shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-primary text-primary-foreground border-r border-primary-foreground/20 flex flex-col">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <img src={nbaLogo} alt="NBA Anaocha Logo" className="h-6 w-6 rounded-sm" />
            <span className="font-heading font-semibold text-sm text-accent">Admin Panel</span>
          </div>
        </div>

        <div className="p-4 md:p-8 animate-fade-in">{children}</div>
      </main>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of the admin panel.
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

export default AdminLayout;
