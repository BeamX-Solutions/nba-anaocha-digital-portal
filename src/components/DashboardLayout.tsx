import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Scale, Users, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface SidebarItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  sidebarItems: SidebarItem[];
}

const DashboardLayout = ({ children, title, sidebarItems }: DashboardLayoutProps) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-sidebar-border space-y-3">
        <h2 className="font-heading text-lg font-bold text-sidebar-primary">{title}</h2>
        <div className="flex gap-1.5">
          <Link
            to="/anaocha/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-semibold bg-sidebar-accent text-accent border border-accent/30"
          >
            <Users className="h-3 w-3" /> Anaocha
          </Link>
          <Link
            to="/remuneration/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors duration-200"
          >
            <Scale className="h-3 w-3" /> Remuneration
          </Link>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
              location.pathname === item.href
                ? "bg-sidebar-accent text-sidebar-primary translate-x-0.5 shadow-sm"
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
      <Header />
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
          <SidebarContent />
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-muted/30">
          {/* Mobile menu bar */}
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <span className="font-heading font-semibold text-sm text-foreground">{title}</span>
          </div>
          <div className="p-6 lg:p-8 animate-fade-in">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
