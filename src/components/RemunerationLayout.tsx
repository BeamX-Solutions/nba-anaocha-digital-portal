import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import RemunerationHeader from "@/components/RemunerationHeader";
import Footer from "@/components/Footer";

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

  return (
    <div className="min-h-screen flex flex-col">
      <RemunerationHeader />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
          <div className="p-6 border-b border-sidebar-border">
            <h2 className="font-heading text-lg font-bold text-accent">Remuneration Portal</h2>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.href
                    ? "bg-accent/20 text-accent"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-muted/30">
          {/* Mobile nav */}
          <div className="lg:hidden overflow-x-auto border-b border-border bg-card">
            <nav className="flex gap-1 p-2">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                    location.pathname === item.href
                      ? "bg-accent text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default RemunerationLayout;
