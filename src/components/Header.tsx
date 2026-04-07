import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/NotificationBell";
import ProfileDropdown from "@/components/ProfileDropdown";
import nbaLogo from "@/assets/nba-logo.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "About Branch", to: "/#about" },
  { label: "Remuneration Portal", to: "/remuneration/about" },
  { label: "Resources", to: "/resources" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to={user ? "/anaocha/dashboard" : "/"} className="flex items-center gap-2">
          <img src={nbaLogo} alt="NBA Anaocha Logo" className="h-10 w-10" />
          <div className="flex flex-col leading-tight">
            <span className="font-heading text-lg font-bold text-primary-foreground">NBA Anaocha</span>
            <span className="text-xs text-primary-foreground/70">Anambra State, Nigeria</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <NotificationBell viewAllHref="/anaocha/notifications" />
              <ProfileDropdown />
            </>
          ) : (
            <>
              <nav className="hidden md:flex items-center gap-6 mr-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === link.to
                        ? "text-accent"
                        : "text-primary-foreground/80 hover:text-primary-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="hidden md:block">
                <Button variant="hero" size="sm" asChild>
                  <Link to="/signin">Log In</Link>
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
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm py-2 font-medium ${
                  location.pathname === link.to
                    ? "text-accent"
                    : "text-primary-foreground/80"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="hero" size="sm" asChild>
                <Link to="/signin" onClick={() => setMobileOpen(false)}>Log In</Link>
              </Button>
              <Button variant="hero-outline" size="sm" asChild>
                <Link to="/signup" onClick={() => setMobileOpen(false)}>Sign Up</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
