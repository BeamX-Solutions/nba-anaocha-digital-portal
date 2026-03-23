import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import nbaLogo from "@/assets/nba-logo.png";

const RemunerationHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: "Home", href: "/remuneration/dashboard" },
    { label: "About Us", href: "/remuneration/about" },
    { label: "← NBA Anaocha Portal", href: "/" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-accent shadow-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/remuneration/dashboard" className="flex items-center gap-2">
          <img src={nbaLogo} alt="NBA Remuneration Portal" className="h-10 w-10" />
          <div className="flex flex-col leading-tight">
            <span className="font-heading text-lg font-bold text-primary">NBA Remuneration</span>
            <span className="text-xs text-primary/70">Remuneration Order 2023</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-sm font-medium text-primary/85 hover:text-primary transition-colors duration-200 relative after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/remuneration/dashboard" className="flex items-center gap-1 text-sm text-primary/85 hover:text-primary">
                <User className="h-4 w-4" />
                <span className="max-w-[120px] truncate">{user.email}</span>
              </Link>
              <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
                <Link to="/signin">Log In</Link>
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden text-primary"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-accent border-t border-primary/20 pb-4">
          <nav className="container flex flex-col gap-2 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm font-medium text-primary/85 hover:text-primary py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              {user ? (
                <Button size="sm" variant="outline" className="border-primary text-primary" onClick={() => { handleSignOut(); setMobileOpen(false); }}>
                  <LogOut className="h-4 w-4 mr-1" /> Sign Out
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="outline" className="border-primary text-primary" asChild>
                    <Link to="/signin" onClick={() => setMobileOpen(false)}>Log In</Link>
                  </Button>
                  <Button size="sm" className="bg-primary text-primary-foreground" asChild>
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

export default RemunerationHeader;
