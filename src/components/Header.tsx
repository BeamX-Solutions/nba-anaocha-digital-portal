import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import nbaLogo from "@/assets/nba-logo.png";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "NBA Anaocha", href: "/anaocha/about" },
    { label: "Remuneration Portal", href: "/remuneration/about" },
    { label: "Resources", href: "/resources" },
    { label: "Blog/Updates", href: "/blog" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={nbaLogo} alt="NBA Anaocha Logo" className="h-10 w-10" />
          <div className="flex flex-col leading-tight">
            <span className="font-heading text-lg font-bold text-primary-foreground">NBA Anaocha</span>
            <span className="text-xs text-primary-foreground/70">Anambra State, Nigeria</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-sm font-medium text-primary-foreground/85 hover:text-primary-foreground transition-colors duration-200 relative after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/anaocha/dashboard" className="flex items-center gap-1 text-sm text-primary-foreground/85 hover:text-primary-foreground">
                <User className="h-4 w-4" />
                <span className="max-w-[120px] truncate">{user.email}</span>
              </Link>
              <Button variant="hero-outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="hero-outline" size="sm" asChild>
                <Link to="/signin">Sign In</Link>
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
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm font-medium text-primary-foreground/85 hover:text-primary-foreground py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              {user ? (
                <Button variant="hero-outline" size="sm" onClick={() => { handleSignOut(); setMobileOpen(false); }}>
                  <LogOut className="h-4 w-4 mr-1" /> Sign Out
                </Button>
              ) : (
                <>
                  <Button variant="hero-outline" size="sm" asChild>
                    <Link to="/signin" onClick={() => setMobileOpen(false)}>Sign In</Link>
                  </Button>
                  <Button variant="hero" size="sm" asChild>
                    <Link to="/signup" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
