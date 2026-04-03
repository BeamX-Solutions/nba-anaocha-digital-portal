import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/NotificationBell";
import ProfileDropdown from "@/components/ProfileDropdown";
import nbaLogo from "@/assets/nba-logo.png";

const RemunerationHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

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

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <NotificationBell viewAllHref="/remuneration/notifications" />
              <ProfileDropdown />
            </>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-4">
                <Button variant="hero-outline" size="sm" asChild>
                  <Link to="/signin">Log In</Link>
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
              <button
                className="md:hidden text-primary-foreground"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </>
          )}
        </div>
      </div>

      {mobileOpen && !user && (
        <div className="md:hidden bg-primary border-t border-sidebar-border pb-4">
          <nav className="container flex flex-col gap-2 pt-2">
            <div className="flex gap-2 pt-2">
              <Button variant="hero-outline" size="sm" asChild>
                <Link to="/signin" onClick={() => setMobileOpen(false)}>Log In</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/signup" onClick={() => setMobileOpen(false)}>Sign Up</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default RemunerationHeader;
