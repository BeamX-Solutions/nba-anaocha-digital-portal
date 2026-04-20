import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import RemunerationHeader from "@/components/RemunerationHeader";
import { Scale, Users, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface RemunerationLayoutProps {
  children: ReactNode;
  sidebarItems: SidebarItem[];
}

const RemunerationLayout = ({ children, sidebarItems }: RemunerationLayoutProps) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { portalAccess } = useAuth();
  const isRemunerationOnly = portalAccess === "remuneration";

  const SidebarContent = () => (
    <>
      {/* Portal Switcher - Show only for Anaocha members with remuneration access */}
      {!isRemunerationOnly && (
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex gap-1.5">
            <Link
              to="/anaocha/dashboard"
              onClick={() => setMobileOpen(false)}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-semibold transition-colors duration-200 ${
                location.pathname.startsWith("/anaocha")
                  ? "bg-sidebar-accent text-accent border border-accent/30"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Users className="h-3 w-3" /> Anaocha
            </Link>
            <Link
              to="/remuneration/dashboard"
              onClick={() => setMobileOpen(false)}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-semibold transition-colors duration-200 ${
                location.pathname.startsWith("/remuneration")
                  ? "bg-sidebar-accent text-accent border border-accent/30"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Scale className="h-3 w-3" /> Remuneration
            </Link>
          </div>
        </div>
      )}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
              location.pathname === item.href
                ? "bg-accent/20 text-accent translate-x-0.5 shadow-sm"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:translate-x-0.5"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <RemunerationHeader sidebarContent={<SidebarContent />} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
          <SidebarContent />
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-muted/30">
          <div className="p-6 lg:p-8 animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default RemunerationLayout;
