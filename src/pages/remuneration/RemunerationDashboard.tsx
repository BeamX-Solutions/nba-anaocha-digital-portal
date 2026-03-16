import { Home, FileText, FolderOpen, CreditCard, Search, Bell, File } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const sidebarItems = [
  { label: "Home", href: "/remuneration/dashboard", icon: <Home className="h-4 w-4" /> },
  { label: "Prepare a Document", href: "/remuneration/prepare", icon: <FileText className="h-4 w-4" /> },
  { label: "My Documents", href: "/remuneration/documents", icon: <FolderOpen className="h-4 w-4" /> },
  { label: "Payment History", href: "/remuneration/payments", icon: <CreditCard className="h-4 w-4" /> },
  { label: "Find a Document", href: "/remuneration/search", icon: <Search className="h-4 w-4" /> },
  { label: "Apply", href: "/remuneration/apply", icon: <File className="h-4 w-4" /> },
  { label: "Notifications", href: "/remuneration/notifications", icon: <Bell className="h-4 w-4" /> },
];

const RemunerationDashboard = () => (
  <DashboardLayout title="Remuneration Portal" sidebarItems={sidebarItems}>
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Remuneration Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Prepare legal documents and ensure compliance with Remuneration Order 2023.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-card hover:shadow-lg transition-shadow border-t-4 border-t-primary">
          <CardContent className="p-6">
            <FileText className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-heading text-lg font-semibold mb-2">Prepare a Document</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate or format legal documents with AI or from your precedent.
            </p>
            <Button variant="default" asChild>
              <Link to="/remuneration/prepare">Start</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-lg transition-shadow border-t-4 border-t-accent">
          <CardContent className="p-6">
            <FolderOpen className="h-8 w-8 text-accent mb-3" />
            <h3 className="font-heading text-lg font-semibold mb-2">My Documents</h3>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage your previously prepared legal documents.
            </p>
            <Button variant="accent" asChild>
              <Link to="/remuneration/documents">View</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-lg transition-shadow border-t-4 border-t-primary">
          <CardContent className="p-6">
            <CreditCard className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-heading text-lg font-semibold mb-2">Payment History</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Track your remuneration payments and download receipts.
            </p>
            <Button variant="outline" asChild>
              <Link to="/remuneration/payments">View</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </DashboardLayout>
);

export default RemunerationDashboard;
