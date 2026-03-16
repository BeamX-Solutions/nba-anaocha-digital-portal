import { Home, FileText, FolderOpen, CreditCard, Search, Bell, File } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { label: "Home", href: "/remuneration/dashboard", icon: <Home className="h-4 w-4" /> },
  { label: "Prepare a Document", href: "/remuneration/prepare", icon: <FileText className="h-4 w-4" /> },
  { label: "My Documents", href: "/remuneration/documents", icon: <FolderOpen className="h-4 w-4" /> },
  { label: "Payment History", href: "/remuneration/payments", icon: <CreditCard className="h-4 w-4" /> },
  { label: "Find a Document", href: "/remuneration/search", icon: <Search className="h-4 w-4" /> },
  { label: "Apply", href: "/remuneration/apply", icon: <File className="h-4 w-4" /> },
  { label: "Notifications", href: "/remuneration/notifications", icon: <Bell className="h-4 w-4" /> },
];

const FindDocument = () => (
  <DashboardLayout title="Remuneration Portal" sidebarItems={sidebarItems}>
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Find a Document</h1>
        <p className="text-muted-foreground mt-1">Search previously generated documents by name, date, or reference.</p>
      </div>
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search by document name, reference number, or party name..."
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button variant="default">Search</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-card">
        <CardContent className="p-8 text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Enter a search term to find documents.</p>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

export default FindDocument;
