import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Bell, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/NotificationBell";
import ProfileDropdown from "@/components/ProfileDropdown";
import nbaLogo from "@/assets/nba-logo.png";

const RemunerationHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/remuneration/dashboard" className="flex items-center gap-2">
          <img src={nbaLogo} alt="NBA Remuneration Portal" className="h-10 w-10" />
          <div className="flex flex-col leading-tight">
            <span className="font-heading text-lg font-bold text-primary-foreground">NBA Remuneration</span>
            <span className="text-xs text-primary-foreground/70">Remuneration Order 2023</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <NotificationBell viewAllHref="/remuneration/notifications" />
              <ProfileDropdown />
            </>
          ) : (
            <>
              <Button variant="hero-outline" size="sm" asChild>
                <Link to="/signin">Log In</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden text-primary-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-primary border-t border-sidebar-border pb-4">
          <nav className="container flex flex-col gap-2 pt-2">
            {user ? (
              <div className="flex flex-col gap-1 pt-2">
                <Link
                  to="/remuneration/notifications"
                  className="flex items-center gap-2 text-sm text-primary-foreground/85 hover:text-primary-foreground py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <Bell className="h-4 w-4" /> Notifications
                </Link>
                <Link
                  to="/anaocha/profile"
                  className="flex items-center gap-2 text-sm text-primary-foreground/85 hover:text-primary-foreground py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <User className="h-4 w-4" /> My Profile
                </Link>
                <button
                  className="flex items-center gap-2 text-sm text-primary-foreground/85 hover:text-primary-foreground py-2 text-left"
                  onClick={() => { handleSignOut(); setMobileOpen(false); }}
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <Button variant="hero-outline" size="sm" asChild>
                  <Link to="/signin" onClick={() => setMobileOpen(false)}>Log In</Link>
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/signup" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default RemunerationHeader;
