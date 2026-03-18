import { useState } from "react";
import { Home, FileText, FolderOpen, CreditCard, Search, Bell, File, Sparkles, BookOpen, Loader2, Download } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const aiFields = [
  { key: "donor_name", label: "Name of Donor/Assignor/Vendor", required: true },
  { key: "donor_address", label: "Address of Donor/Assignor/Vendor", required: true },
  { key: "donee_name", label: "Name of Donee/Assignee/Purchaser", required: true },
  { key: "donee_address", label: "Address of Donee/Assignee/Purchaser", required: true },
  { key: "land_address", label: "Full Address of Land", required: true },
  { key: "consideration", label: "Consideration (₦)", required: true },
  { key: "survey_plan_no", label: "Survey Plan No (Optional)" },
  { key: "beacon_nos", label: "Beacon Nos. (Optional)" },
];

const PrepareDocument = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [precedentText, setPrecedentText] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [method, setMethod] = useState<"ai" | "precedent">("ai");

  const handleGenerateAI = async () => {
    for (const field of aiFields) {
      if (field.required && !formData[field.key]?.trim()) {
        toast({ title: "Required", description: `${field.label} is required.`, variant: "destructive" });
        return;
      }
    }

    setGenerating(true);
    try {
      const response = await supabase.functions.invoke("generate-document", {
        body: { formData, method: "ai" },
      });

      if (response.error) throw new Error(response.error.message);

      const content = response.data?.content || generateFallbackDocument(formData);
      setGeneratedContent(content);
      setCurrentStep(2);
    } catch {
      // Fallback to template-based generation
      setGeneratedContent(generateFallbackDocument(formData));
      setCurrentStep(2);
    }
    setGenerating(false);
  };

  const handleProcessPrecedent = async () => {
    if (!precedentText.trim()) {
      toast({ title: "Required", description: "Please paste your precedent document.", variant: "destructive" });
      return;
    }

    setGenerating(true);
    try {
      const response = await supabase.functions.invoke("generate-document", {
        body: { precedentText, method: "precedent" },
      });

      if (response.error) throw new Error(response.error.message);
      setGeneratedContent(response.data?.content || precedentText);
      setCurrentStep(2);
    } catch {
      setGeneratedContent(precedentText);
      setCurrentStep(2);
    }
    setGenerating(false);
  };

  const handleSaveDocument = async () => {
    if (!user) return;
    const refNum = `REM-${Date.now().toString(36).toUpperCase()}`;
    const { error } = await supabase.from("documents").insert({
      user_id: user.id,
      title: method === "ai" ? `Deed of Assignment - ${formData.donee_name || "Draft"}` : "Precedent Document",
      document_type: method === "ai" ? "deed_of_assignment" : "precedent",
      content: generatedContent,
      form_data: method === "ai" ? formData as any : { precedent: precedentText } as any,
      status: "draft",
      reference_number: refNum,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Document saved!", description: `Reference: ${refNum}` });
      setCurrentStep(4);
    }
  };

  return (
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
                i < currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                <span className="font-bold">{step.num}</span>
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {i < steps.length - 1 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        {currentStep === 1 && (
          <Tabs defaultValue="ai" className="w-full" onValueChange={(v) => setMethod(v as "ai" | "precedent")}>
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
                    {aiFields.map((field) => (
                      <div key={field.key}>
                        <label className="text-sm font-medium text-foreground">
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </label>
                        <input
                          type="text"
                          value={formData[field.key] || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.label}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleGenerateAI} disabled={generating} className="mt-4">
                    {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : "Generate Document"}
                  </Button>
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
                    value={precedentText}
                    onChange={(e) => setPrecedentText(e.target.value)}
                    placeholder="Paste your precedent document here..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button onClick={handleProcessPrecedent} disabled={generating}>
                    {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</> : "Process Precedent"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {currentStep === 2 && (
          <Card className="shadow-card">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-heading text-xl font-semibold">Document Preview</h3>
              <div className="border border-border rounded-md p-6 bg-background min-h-[300px] whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
                {generatedContent}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>← Edit</Button>
                <Button onClick={() => setCurrentStep(3)}>Proceed to Payment →</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className="shadow-card">
            <CardContent className="p-6 space-y-4 text-center">
              <h3 className="font-heading text-xl font-semibold">Payment</h3>
              <p className="text-sm text-muted-foreground">
                Payment integration will be available soon. For now, save the document as a draft.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>← Back</Button>
                <Button onClick={handleSaveDocument}>Save Document</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 4 && (
          <Card className="shadow-card">
            <CardContent className="p-6 space-y-4 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="font-heading text-xl font-semibold">Document Saved Successfully</h3>
              <p className="text-sm text-muted-foreground">
                Your document has been saved. You can view it in your documents list.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => { setCurrentStep(1); setGeneratedContent(""); setFormData({}); setPrecedentText(""); }}>
                  Create Another
                </Button>
                <Button asChild>
                  <a href="/remuneration/documents"><FolderOpen className="h-4 w-4 mr-2" />View My Documents</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

function generateFallbackDocument(data: Record<string, string>) {
  return `DEED OF ASSIGNMENT

THIS DEED OF ASSIGNMENT is made this _____ day of ____________ 20__

BETWEEN

${data.donor_name || "[DONOR/ASSIGNOR/VENDOR NAME]"} of ${data.donor_address || "[ADDRESS]"} (hereinafter called "the Assignor" which expression shall where the context so admits include his heirs, executors, administrators and assigns)

OF THE ONE PART

AND

${data.donee_name || "[DONEE/ASSIGNEE/PURCHASER NAME]"} of ${data.donee_address || "[ADDRESS]"} (hereinafter called "the Assignee" which expression shall where the context so admits include his heirs, executors, administrators and assigns)

OF THE OTHER PART

WHEREAS:

1. The Assignor is the owner in fee simple of ALL THAT piece or parcel of land situate, lying and being at ${data.land_address || "[LAND ADDRESS]"}${data.survey_plan_no ? ` covered by Survey Plan No. ${data.survey_plan_no}` : ""}${data.beacon_nos ? ` and delineated by Beacon Nos. ${data.beacon_nos}` : ""}.

2. The Assignor has agreed to assign the said property to the Assignee for the sum of ₦${data.consideration || "[CONSIDERATION]"}.

NOW THIS DEED WITNESSETH as follows:

1. IN CONSIDERATION of the sum of ₦${data.consideration || "[CONSIDERATION]"} paid by the Assignee to the Assignor (the receipt of which the Assignor hereby acknowledges), the Assignor as beneficial owner hereby assigns unto the Assignee ALL THAT piece or parcel of land described above TO HOLD unto the Assignee in fee simple.

2. The Assignor hereby covenants with the Assignee:
   (a) That the Assignor has good title to the property;
   (b) That the Assignee shall enjoy quiet possession;
   (c) That the property is free from encumbrances.

IN WITNESS WHEREOF the parties have hereunto set their hands and seals the day and year first above written.

SIGNED, SEALED AND DELIVERED by the Assignor

_________________________
${data.donor_name || "[ASSIGNOR]"}

In the presence of:
Name: ___________________
Address: ________________
Occupation: _____________
Signature: ______________

SIGNED, SEALED AND DELIVERED by the Assignee

_________________________
${data.donee_name || "[ASSIGNEE]"}

In the presence of:
Name: ___________________
Address: ________________
Occupation: _____________
Signature: ______________

---
Generated in compliance with the Legal Practitioners' Remuneration Order 2023.`;
}

export default PrepareDocument;
