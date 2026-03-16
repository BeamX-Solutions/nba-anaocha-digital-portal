import { Home, FileText, FolderOpen, CreditCard, Search, Bell, File } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";

const sidebarItems = [
  { label: "Home", href: "/remuneration/dashboard", icon: <Home className="h-4 w-4" /> },
  { label: "Prepare a Document", href: "/remuneration/prepare", icon: <FileText className="h-4 w-4" /> },
  { label: "My Documents", href: "/remuneration/documents", icon: <FolderOpen className="h-4 w-4" /> },
  { label: "Payment History", href: "/remuneration/payments", icon: <CreditCard className="h-4 w-4" /> },
  { label: "Find a Document", href: "/remuneration/search", icon: <Search className="h-4 w-4" /> },
  { label: "Apply", href: "/remuneration/apply", icon: <File className="h-4 w-4" /> },
  { label: "Notifications", href: "/remuneration/notifications", icon: <Bell className="h-4 w-4" /> },
];

const MyDocuments = () => (
  <DashboardLayout title="Remuneration Portal" sidebarItems={sidebarItems}>
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">My Documents</h1>
        <p className="text-muted-foreground mt-1">View and manage your prepared legal documents.</p>
      </div>
      <Card className="shadow-card">
        <CardContent className="p-8 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No documents yet. Prepare your first document to see it here.</p>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

export default MyDocuments;
