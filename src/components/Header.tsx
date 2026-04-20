import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/NotificationBell";
import ProfileDropdown from "@/components/ProfileDropdown";
import nbaLogo from "@/assets/nba-logo.png";

const navLinks = [
  { label: "About", to: "#about" },
  { label: "Committees", to: "#committees" },
  { label: "Remuneration", to: "/remuneration/about", external: false },
  { label: "Resources", to: "/resources", external: false },
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
    <header className={`sticky top-0 z-50 shadow-sm ${user ? "bg-primary" : "bg-background border-b border-border"}`}>
      <div className="container flex h-16 items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2" aria-label="NBA Anaocha Home">
          <img src={nbaLogo} alt="NBA Anaocha Logo" className="h-9 w-9" />
          <span className={`font-heading text-base font-bold tracking-tight ${user ? "text-primary-foreground" : "text-foreground"}`}>NBA ANAOCHA</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <NotificationBell viewAllHref="/anaocha/notifications" />
              <ProfileDropdown />
            </>
          ) : (
            <>
              <nav className="hidden md:flex items-center gap-7 mr-2">
                {navLinks.map((link) =>
                  link.to.startsWith("#") ? (
                    <a
                      key={link.to}
                      href={link.to}
                      className="text-xs font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="text-xs font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </nav>
              <div className="hidden md:block">
                <Link
                  to="/signin"
                  className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Portal Access <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <button
                className="md:hidden text-foreground"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </>
          )}
        </div>
      </div>

      {mobileOpen && !user && (
        <div className="md:hidden bg-background border-t border-border pb-4">
          <nav className="container flex flex-col gap-1 pt-2">
            {navLinks.map((link) =>
              link.to.startsWith("#") ? (
                <a
                  key={link.to}
                  href={link.to}
                  className="text-xs font-semibold tracking-widest uppercase text-muted-foreground py-3 border-b border-border/50"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-xs font-semibold tracking-widest uppercase text-muted-foreground py-3 border-b border-border/50"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="flex gap-2 pt-3">
              <Link
                to="/signin"
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-md"
                onClick={() => setMobileOpen(false)}
              >
                Portal Access <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center text-sm font-semibold px-4 py-2 rounded-md border border-border text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
