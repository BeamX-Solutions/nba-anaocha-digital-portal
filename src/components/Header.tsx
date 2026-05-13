import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/NotificationBell";
import ProfileDropdown from "@/components/ProfileDropdown";
import nbaLogo from "@/assets/nba-logo.png";

const navLinks = [
  { label: "About", to: "/#about" },
  { label: "Committees", to: "/#committees" },
  { label: "Resources", to: "/#resources" },
];

const authPaths = ["/signin", "/signup", "/forgot-password", "/reset-password", "/complete-profile"];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = authPaths.includes(location.pathname);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-50 shadow-sm bg-background border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label="NBA Anaocha Home">
            <img src={nbaLogo} alt="NBA Anaocha Logo" className="h-9 w-9" />
            <span className="font-heading text-base font-bold tracking-tight text-foreground">NBA ANAOCHA</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
        </div>
      </header>
    );
  }

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
                {navLinks.map((link) => (
                  <a
                    key={link.to}
                    href={link.to}
                    className="text-xs font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="hidden md:block">
                <Link
                  to="/signin"
                  className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Log In
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
            {navLinks.map((link) => (
              <a
                key={link.to}
                href={link.to}
                className="text-xs font-semibold tracking-widest uppercase text-muted-foreground py-3 border-b border-border/50"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex gap-2 pt-3">
              <Link
                to="/signin"
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-md"
                onClick={() => setMobileOpen(false)}
              >
                Log In
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
