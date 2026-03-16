import { Home, FileText, FolderOpen, CreditCard, Search, Bell, File, Sparkles, BookOpen } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const sidebarItems = [
  { label: "Home", href: "/remuneration/dashboard", icon: <Home className="h-4 w-4" /> },
  { label: "Prepare a Document", href: "/remuneration/prepare", icon: <FileText className="h-4 w-4" /> },
  { label: "My Documents", href: "/remuneration/documents", icon: <FolderOpen className="h-4 w-4" /> },
  { label: "Payment History", href: "/remuneration/payments", icon: <CreditCard className="h-4 w-4" /> },
  { label: "Find a Document", href: "/remuneration/search", icon: <Search className="h-4 w-4" /> },
  { label: "Apply", href: "/remuneration/apply", icon: <File className="h-4 w-4" /> },
  { label: "Notifications", href: "/remuneration/notifications", icon: <Bell className="h-4 w-4" /> },
];

const steps = [
  { num: 1, label: "Prepare a Document" },
  { num: 2, label: "Preview" },
  { num: 3, label: "Payment" },
  { num: 4, label: "Final Document" },
];

const PrepareDocument = () => (
  <DashboardLayout title="Remuneration Portal" sidebarItems={sidebarItems}>
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Prepare a Document</h1>
        <p className="text-muted-foreground mt-1">
          Choose your method to prepare a legal document compliant with Remuneration Order 2023.
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={step.num} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              <span className="font-bold">{step.num}</span>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < steps.length - 1 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* Method selection */}
      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Generated
          </TabsTrigger>
          <TabsTrigger value="precedent" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Use Precedent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai">
          <Card className="shadow-card mt-4">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-heading text-xl font-semibold">AI Generated Document Draft</h3>
              <p className="text-sm text-muted-foreground">
                Fill in the smart form below and our AI will generate a legally compliant document draft.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Name of Donor/Assignor/Vendor",
                  "Address of Donor/Assignor/Vendor",
                  "Name of Donee/Assignee/Purchaser",
                  "Address of Donee/Assignee/Purchaser",
                  "Full Address of Land",
                  "Consideration (₦)",
                  "Survey Plan No (Optional)",
                  "Beacon Nos. (Optional)",
                ].map((field) => (
                  <div key={field}>
                    <label className="text-sm font-medium text-foreground">{field}</label>
                    <input
                      type="text"
                      placeholder={field}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}
              </div>
              <Button variant="default" className="mt-4">Generate Document</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="precedent">
          <Card className="shadow-card mt-4">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-heading text-xl font-semibold">Use Your Precedent</h3>
              <p className="text-sm text-muted-foreground">
                Paste your existing precedent document. The system will reformat it, add remuneration compliance, and generate a final version.
              </p>
              <textarea
                rows={10}
                placeholder="Paste your precedent document here..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button variant="default">Process Precedent</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </DashboardLayout>
);

export default PrepareDocument;
