import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/NotificationBell";
import ProfileDropdown from "@/components/ProfileDropdown";
import nbaLogo from "@/assets/nba-logo.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface RemunerationHeaderProps {
  sidebarContent?: ReactNode;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

const RemunerationHeader = ({ sidebarContent, mobileOpen = false, setMobileOpen = () => {} }: RemunerationHeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-md">
      <div className="flex h-16 items-center justify-between">
        {/* Mobile: Hamburger + Logo */}
        <div className="md:hidden flex items-center gap-0">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-20 w-20 text-primary-foreground hover:bg-primary/80 transition-colors">
                <Menu className="h-8 w-8" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
              {sidebarContent}
            </SheetContent>
          </Sheet>
          <Link to="/remuneration/dashboard" className="flex items-center">
            <img src={nbaLogo} alt="NBA Remuneration Portal" className="h-9 w-9" />
          </Link>
        </div>

        {/* Desktop: Full Logo + Text */}
        <Link to="/remuneration/dashboard" className="hidden md:flex items-center gap-2 container px-0">
          <img src={nbaLogo} alt="NBA Remuneration Portal" className="h-10 w-10" />
          <div className="flex flex-col leading-tight">
            <span className="font-heading text-lg font-bold text-primary-foreground">NBA Remuneration</span>
            <span className="text-xs text-primary-foreground/70">Remuneration Order 2023</span>
          </div>
        </Link>

        <div className="flex items-center gap-4 pr-6">
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
