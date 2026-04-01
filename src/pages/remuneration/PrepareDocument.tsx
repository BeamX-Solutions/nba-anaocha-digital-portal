import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, BookOpen, FolderOpen } from "lucide-react";
import RemunerationLayout from "@/components/RemunerationLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { remunerationSidebarItems } from "@/lib/sidebarItems";

const steps = [
  { num: 1, label: "Prepare a Document" },
  { num: 2, label: "Preview" },
  { num: 3, label: "Payment" },
  { num: 4, label: "Final Document" },
];

type DocType = "deed_of_assignment" | "deed_of_gift" | "mortgage_deed" | "power_of_attorney" | "contract_of_sale" | "tenancy_agreement";

interface FieldDef {
  key: string;
  label: string;
  required?: boolean;
}

const DOC_TYPES: { value: DocType; label: string; fields: FieldDef[] }[] = [
  {
    value: "deed_of_assignment",
    label: "Deed of Assignment",
    fields: [
      { key: "donor_name", label: "Name of Assignor/Vendor", required: true },
      { key: "donor_address", label: "Address of Assignor/Vendor", required: true },
      { key: "donee_name", label: "Name of Assignee/Purchaser", required: true },
      { key: "donee_address", label: "Address of Assignee/Purchaser", required: true },
      { key: "land_address", label: "Full Address of Land", required: true },
      { key: "consideration", label: "Consideration (₦)", required: true },
      { key: "survey_plan_no", label: "Survey Plan No (Optional)" },
      { key: "beacon_nos", label: "Beacon Nos. (Optional)" },
    ],
  },
  {
    value: "deed_of_gift",
    label: "Deed of Gift",
    fields: [
      { key: "donor_name", label: "Name of Donor", required: true },
      { key: "donor_address", label: "Address of Donor", required: true },
      { key: "donee_name", label: "Name of Donee", required: true },
      { key: "donee_address", label: "Address of Donee", required: true },
      { key: "land_address", label: "Full Address of Property", required: true },
      { key: "survey_plan_no", label: "Survey Plan No (Optional)" },
      { key: "beacon_nos", label: "Beacon Nos. (Optional)" },
    ],
  },
  {
    value: "mortgage_deed",
    label: "Mortgage Deed",
    fields: [
      { key: "donor_name", label: "Name of Mortgagor", required: true },
      { key: "donor_address", label: "Address of Mortgagor", required: true },
      { key: "donee_name", label: "Name of Mortgagee (Lender)", required: true },
      { key: "donee_address", label: "Address of Mortgagee", required: true },
      { key: "land_address", label: "Full Address of Mortgaged Property", required: true },
      { key: "consideration", label: "Loan Amount (₦)", required: true },
      { key: "interest_rate", label: "Interest Rate (%)", required: true },
      { key: "repayment_period", label: "Repayment Period", required: true },
      { key: "survey_plan_no", label: "Survey Plan No (Optional)" },
    ],
  },
  {
    value: "power_of_attorney",
    label: "Power of Attorney",
    fields: [
      { key: "donor_name", label: "Name of Donor (Principal)", required: true },
      { key: "donor_address", label: "Address of Donor", required: true },
      { key: "donee_name", label: "Name of Attorney", required: true },
      { key: "donee_address", label: "Address of Attorney", required: true },
      { key: "scope_of_authority", label: "Scope of Authority", required: true },
      { key: "land_address", label: "Address of Property (if applicable)" },
      { key: "duration", label: "Duration / Expiry" },
    ],
  },
  {
    value: "contract_of_sale",
    label: "Contract of Sale",
    fields: [
      { key: "donor_name", label: "Name of Vendor", required: true },
      { key: "donor_address", label: "Address of Vendor", required: true },
      { key: "donee_name", label: "Name of Purchaser", required: true },
      { key: "donee_address", label: "Address of Purchaser", required: true },
      { key: "land_address", label: "Full Address of Property", required: true },
      { key: "consideration", label: "Purchase Price (₦)", required: true },
      { key: "deposit_amount", label: "Deposit Amount (₦)" },
      { key: "completion_date", label: "Completion Date" },
      { key: "survey_plan_no", label: "Survey Plan No (Optional)" },
    ],
  },
  {
    value: "tenancy_agreement",
    label: "Tenancy Agreement",
    fields: [
      { key: "donor_name", label: "Name of Landlord", required: true },
      { key: "donor_address", label: "Address of Landlord", required: true },
      { key: "donee_name", label: "Name of Tenant", required: true },
      { key: "donee_address", label: "Address of Tenant", required: true },
      { key: "land_address", label: "Full Address of Premises", required: true },
      { key: "consideration", label: "Annual Rent (₦)", required: true },
      { key: "tenancy_duration", label: "Duration of Tenancy", required: true },
      { key: "commencement_date", label: "Commencement Date", required: true },
    ],
  },
];

const PrepareDocument = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [docType, setDocType] = useState<DocType>("deed_of_assignment");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [precedentText, setPrecedentText] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [method, setMethod] = useState<"ai" | "precedent">("ai");

  const selectedDoc = DOC_TYPES.find((d) => d.value === docType)!;

  const handleGenerateAI = async () => {
    for (const field of selectedDoc.fields) {
      if (field.required && !formData[field.key]?.trim()) {
        toast({ title: "Required", description: `${field.label} is required.`, variant: "destructive" });
        return;
      }
    }

    setGenerating(true);
    try {
      const response = await supabase.functions.invoke("generate-document", {
        body: { formData, method: "ai", documentType: docType },
      });

      if (response.error) throw new Error(response.error.message);

      const content = response.data?.content || generateFallbackDocument(docType, formData);
      setGeneratedContent(content);
      setCurrentStep(2);
    } catch {
      setGeneratedContent(generateFallbackDocument(docType, formData));
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
      title: method === "ai"
        ? `${selectedDoc.label} — ${formData.donee_name || formData.donor_name || "Draft"}`
        : "Precedent Document",
      document_type: method === "ai" ? docType : "precedent",
      content: generatedContent,
      form_data: method === "ai" ? (formData as any) : ({ precedent: precedentText } as any),
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

  const resetForm = () => {
    setCurrentStep(1);
    setGeneratedContent("");
    setFormData({});
    setPrecedentText("");
    setDocType("deed_of_assignment");
  };

  return (
    <RemunerationLayout sidebarItems={remunerationSidebarItems}>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Prepare a Document</h1>
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
                <CardContent className="p-6 space-y-5">
                  <h3 className="font-heading text-xl font-semibold">AI Generated Document Draft</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a document type, fill the smart form, and our AI will generate a legally compliant draft.
                  </p>

                  {/* Document type selector */}
                  <div>
                    <label className="text-sm font-medium text-foreground">Document Type <span className="text-destructive">*</span></label>
                    <div className="relative mt-1">
                      <select
                        value={docType}
                        onChange={(e) => { setDocType(e.target.value as DocType); setFormData({}); }}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none pr-8"
                      >
                        {DOC_TYPES.map((d) => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDoc.fields.map((field) => (
                      <div key={field.key} className={field.key === "scope_of_authority" ? "md:col-span-2" : ""}>
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
                  <Button onClick={handleGenerateAI} disabled={generating} className="mt-2">
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
              <p className="text-muted-foreground text-sm">
                In line with the <strong>Legal Practitioners' Remuneration Order 2023</strong>, a fee of{" "}
                <strong>10% of the consideration</strong> is due before the final document is issued.
              </p>
              {formData.consideration && (
                <div className="inline-block bg-accent/10 border border-accent/30 rounded-lg px-6 py-4">
                  <p className="text-sm text-muted-foreground">Amount Due</p>
                  <p className="font-heading text-2xl font-bold text-primary">
                    ₦{(parseFloat(formData.consideration.replace(/,/g, "")) * 0.1).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">10% of ₦{formData.consideration}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Payment gateway integration is coming soon. For now, save the document as a draft and complete payment through the branch secretariat.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>← Back</Button>
                <Button onClick={handleSaveDocument}>Save Document as Draft</Button>
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
                Your document has been saved as a draft. Complete payment at the branch secretariat to receive the final BAIN-stamped document.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={resetForm}>Create Another</Button>
                <Button asChild>
                  <a href="/remuneration/documents"><FolderOpen className="h-4 w-4 mr-2" />View My Documents</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RemunerationLayout>
  );
};

// Fallback document generators per type
function generateFallbackDocument(type: DocType, data: Record<string, string>): string {
  const today = "_____ day of ____________ 20__";

  switch (type) {
    case "deed_of_assignment":
      return `DEED OF ASSIGNMENT

THIS DEED OF ASSIGNMENT is made this ${today}

BETWEEN

${data.donor_name || "[ASSIGNOR/VENDOR NAME]"} of ${data.donor_address || "[ADDRESS]"} (hereinafter called "the Assignor")

OF THE ONE PART

AND

${data.donee_name || "[ASSIGNEE/PURCHASER NAME]"} of ${data.donee_address || "[ADDRESS]"} (hereinafter called "the Assignee")

OF THE OTHER PART

WHEREAS the Assignor is the beneficial owner of ALL THAT piece or parcel of land situate at ${data.land_address || "[LAND ADDRESS]"}${data.survey_plan_no ? ` covered by Survey Plan No. ${data.survey_plan_no}` : ""}${data.beacon_nos ? `, delineated by Beacon Nos. ${data.beacon_nos}` : ""}.

NOW THIS DEED WITNESSETH that in consideration of the sum of ₦${data.consideration || "[CONSIDERATION]"} paid by the Assignee to the Assignor (receipt acknowledged), the Assignor hereby assigns unto the Assignee the said property TO HOLD in fee simple.

IN WITNESS WHEREOF the parties have executed this Deed the day and year first above written.

SIGNED by the Assignor: _________________________
${data.donor_name || "[ASSIGNOR]"}

SIGNED by the Assignee: _________________________
${data.donee_name || "[ASSIGNEE]"}

---
Generated in compliance with the Legal Practitioners' Remuneration Order 2023.`;

    case "deed_of_gift":
      return `DEED OF GIFT

THIS DEED OF GIFT is made this ${today}

BETWEEN

${data.donor_name || "[DONOR NAME]"} of ${data.donor_address || "[ADDRESS]"} (hereinafter called "the Donor")

OF THE ONE PART

AND

${data.donee_name || "[DONEE NAME]"} of ${data.donee_address || "[ADDRESS]"} (hereinafter called "the Donee")

OF THE OTHER PART

WHEREAS the Donor is the lawful owner of ALL THAT piece or parcel of land situate at ${data.land_address || "[PROPERTY ADDRESS]"}${data.survey_plan_no ? `, Survey Plan No. ${data.survey_plan_no}` : ""}${data.beacon_nos ? `, Beacon Nos. ${data.beacon_nos}` : ""}.

NOW THIS DEED WITNESSETH that the Donor, out of natural love and affection for the Donee, hereby gives, transfers and conveys the said property to the Donee TO HOLD in fee simple, free from all encumbrances.

IN WITNESS WHEREOF the Donor has executed this Deed.

SIGNED by the Donor: _________________________
${data.donor_name || "[DONOR]"}

SIGNED by the Donee: _________________________
${data.donee_name || "[DONEE]"}

---
Generated in compliance with the Legal Practitioners' Remuneration Order 2023.`;

    case "mortgage_deed":
      return `MORTGAGE DEED

THIS MORTGAGE DEED is made this ${today}

BETWEEN

${data.donor_name || "[MORTGAGOR NAME]"} of ${data.donor_address || "[ADDRESS]"} (hereinafter called "the Mortgagor")

AND

${data.donee_name || "[MORTGAGEE NAME]"} of ${data.donee_address || "[ADDRESS]"} (hereinafter called "the Mortgagee")

WHEREAS the Mortgagor is the owner of ALL THAT property situate at ${data.land_address || "[PROPERTY ADDRESS]"}${data.survey_plan_no ? `, Survey Plan No. ${data.survey_plan_no}` : ""}.

NOW THIS DEED WITNESSETH that in consideration of the loan of ₦${data.consideration || "[LOAN AMOUNT]"} granted by the Mortgagee to the Mortgagor at an interest rate of ${data.interest_rate || "[INTEREST RATE]"}% per annum, repayable within ${data.repayment_period || "[REPAYMENT PERIOD]"}, the Mortgagor hereby charges and mortgages the said property to the Mortgagee as security for the loan and interest thereon.

IN WITNESS WHEREOF the parties have executed this Deed.

SIGNED by the Mortgagor: _________________________
${data.donor_name || "[MORTGAGOR]"}

SIGNED by the Mortgagee: _________________________
${data.donee_name || "[MORTGAGEE]"}

---
Generated in compliance with the Legal Practitioners' Remuneration Order 2023.`;

    case "power_of_attorney":
      return `POWER OF ATTORNEY

THIS POWER OF ATTORNEY is made this ${today}

BY

${data.donor_name || "[DONOR/PRINCIPAL NAME]"} of ${data.donor_address || "[ADDRESS]"} (hereinafter called "the Donor/Principal")

IN FAVOUR OF

${data.donee_name || "[ATTORNEY NAME]"} of ${data.donee_address || "[ADDRESS]"} (hereinafter called "the Attorney")

I, ${data.donor_name || "[DONOR/PRINCIPAL NAME]"}, hereby appoint ${data.donee_name || "[ATTORNEY]"} as my lawful Attorney to do the following on my behalf:

${data.scope_of_authority || "[SCOPE OF AUTHORITY]"}

${data.land_address ? `This Power of Attorney relates to the property situate at ${data.land_address}.` : ""}
${data.duration ? `This Power of Attorney shall remain valid until ${data.duration}.` : "This Power of Attorney shall remain valid unless revoked."}

IN WITNESS WHEREOF I have executed this Power of Attorney.

SIGNED by the Donor: _________________________
${data.donor_name || "[DONOR/PRINCIPAL]"}

---
Generated in compliance with the Legal Practitioners' Remuneration Order 2023.`;

    case "contract_of_sale":
      return `CONTRACT OF SALE OF LAND

THIS CONTRACT is made this ${today}

BETWEEN

${data.donor_name || "[VENDOR NAME]"} of ${data.donor_address || "[ADDRESS]"} (hereinafter called "the Vendor")

AND

${data.donee_name || "[PURCHASER NAME]"} of ${data.donee_address || "[ADDRESS]"} (hereinafter called "the Purchaser")

WHEREAS the Vendor is the beneficial owner of ALL THAT piece or parcel of land situate at ${data.land_address || "[PROPERTY ADDRESS]"}${data.survey_plan_no ? `, Survey Plan No. ${data.survey_plan_no}` : ""}.

IT IS HEREBY AGREED as follows:

1. The Vendor agrees to sell and the Purchaser agrees to buy the said property for the sum of ₦${data.consideration || "[PURCHASE PRICE]"}.
${data.deposit_amount ? `2. A deposit of ₦${data.deposit_amount} is payable upon execution of this Contract.` : ""}
${data.completion_date ? `3. Completion shall take place on or before ${data.completion_date}.` : "3. Completion shall take place within 90 days of execution of this Contract."}
4. The Vendor shall deliver a valid title to the property at completion.

IN WITNESS WHEREOF the parties have executed this Contract.

SIGNED by the Vendor: _________________________
${data.donor_name || "[VENDOR]"}

SIGNED by the Purchaser: _________________________
${data.donee_name || "[PURCHASER]"}

---
Generated in compliance with the Legal Practitioners' Remuneration Order 2023.`;

    case "tenancy_agreement":
      return `TENANCY AGREEMENT

THIS TENANCY AGREEMENT is made this ${today}

BETWEEN

${data.donor_name || "[LANDLORD NAME]"} of ${data.donor_address || "[ADDRESS]"} (hereinafter called "the Landlord")

AND

${data.donee_name || "[TENANT NAME]"} of ${data.donee_address || "[ADDRESS]"} (hereinafter called "the Tenant")

1. The Landlord hereby lets to the Tenant the premises situate at ${data.land_address || "[PREMISES ADDRESS]"}.

2. The tenancy shall be for a period of ${data.tenancy_duration || "[DURATION]"} commencing on ${data.commencement_date || "[COMMENCEMENT DATE]"}.

3. The annual rent is ₦${data.consideration || "[ANNUAL RENT]"}, payable in advance.

4. The Tenant shall:
   (a) Pay rent punctually as agreed;
   (b) Keep the premises in good condition;
   (c) Not sublet without the Landlord's written consent;
   (d) Vacate the premises at the end of the tenancy.

5. The Landlord shall:
   (a) Allow the Tenant quiet enjoyment of the premises;
   (b) Carry out structural repairs as required.

IN WITNESS WHEREOF the parties have executed this Agreement.

SIGNED by the Landlord: _________________________
${data.donor_name || "[LANDLORD]"}

SIGNED by the Tenant: _________________________
${data.donee_name || "[TENANT]"}

---
Generated in compliance with the Legal Practitioners' Remuneration Order 2023.`;

    default:
      return "Document template not available.";
  }
}

export default PrepareDocument;
