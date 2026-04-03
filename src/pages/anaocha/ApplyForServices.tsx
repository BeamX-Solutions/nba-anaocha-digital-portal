import { useState, useRef } from "react";
import { Upload, X, Loader2, FileText, BookOpen, CreditCard, Hash, Stamp, ScrollText, ChevronRight, CheckCircle2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { anaochaSidebarItems } from "@/lib/sidebarItems";

interface ServiceConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  textFields: { key: string; label: string; required?: boolean }[];
  fileFields: { key: string; label: string; accept?: string }[];
  action: string;
  serviceType: string;
}

const services: ServiceConfig[] = [
  {
    title: "NBA Diary",
    description: "Order your NBA Diary — a comprehensive resource with member details, court schedules, and branch information.",
    icon: <BookOpen className="h-6 w-6" />,
    color: "text-blue-600 bg-blue-50 border-blue-100",
    textFields: [
      { key: "full_name", label: "Full Name", required: true },
      { key: "phone", label: "Phone Number", required: true },
      { key: "delivery_address", label: "Delivery Address", required: true },
    ],
    fileFields: [],
    action: "Apply Now",
    serviceType: "nba_diary",
  },
  {
    title: "NBA ID Card",
    description: "Apply for your official NBA identification card. Upload passport photo and signature for processing.",
    icon: <CreditCard className="h-6 w-6" />,
    color: "text-primary bg-primary/5 border-primary/10",
    textFields: [
      { key: "full_name", label: "Full Name", required: true },
      { key: "phone", label: "Phone Number", required: true },
      { key: "year_of_call", label: "Year of Call", required: true },
      { key: "office_address", label: "Office Address", required: true },
    ],
    fileFields: [
      { key: "passport_photo", label: "Passport Photo", accept: "image/*" },
      { key: "signature", label: "Signature", accept: "image/*" },
    ],
    action: "Apply Now",
    serviceType: "nba_id_card",
  },
  {
    title: "Bar Identification Number",
    description: "Obtain your unique Bar Identification Number (BAIN) for practice verification and compliance.",
    icon: <Hash className="h-6 w-6" />,
    color: "text-violet-600 bg-violet-50 border-violet-100",
    textFields: [],
    fileFields: [
      { key: "payment_receipt", label: "Receipt of 10% Payment", accept: "image/*,.pdf" },
    ],
    action: "Upload & Apply",
    serviceType: "bain",
  },
  {
    title: "Stamp & Seal",
    description: "Request your official NBA Stamp & Seal for authenticating legal documents and correspondence.",
    icon: <Stamp className="h-6 w-6" />,
    color: "text-accent bg-accent/5 border-accent/10",
    textFields: [],
    fileFields: [
      { key: "practicing_fee_receipt", label: "Practicing Fee Receipt", accept: "image/*,.pdf" },
      { key: "branch_dues_receipt", label: "Branch Dues Receipt", accept: "image/*,.pdf" },
      { key: "stamp_seal_receipt", label: "Stamp & Seal Payment Receipt", accept: "image/*,.pdf" },
    ],
    action: "Upload & Apply",
    serviceType: "stamp_seal",
  },
  {
    title: "Title Document Front Page",
    description: "Apply for the NBA-endorsed front page for your title documents. Upload proof of payment to proceed.",
    icon: <ScrollText className="h-6 w-6" />,
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    textFields: [],
    fileFields: [
      { key: "payment_receipt", label: "Receipt of Payment", accept: "image/*,.pdf" },
    ],
    action: "Upload & Apply",
    serviceType: "title_document_front_page",
  },
];

const ApplyForServices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openService, setOpenService] = useState<ServiceConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const openModal = (service: ServiceConfig) => {
    setOpenService(service);
    setFormData({});
    setFiles({});
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    if (!user || !openService) return;

    for (const field of openService.textFields) {
      if (field.required && !formData[field.key]?.trim()) {
        toast({ title: "Required field missing", description: `${field.label} is required.`, variant: "destructive" });
        return;
      }
    }

    for (const field of openService.fileFields) {
      if (!files[field.key]) {
        toast({ title: "Document required", description: `Please upload ${field.label}.`, variant: "destructive" });
        return;
      }
    }

    setSubmitting(true);

    const fileUrls: string[] = [];
    for (const [key, file] of Object.entries(files)) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${openService.serviceType}/${key}.${ext}`;
      const { error } = await supabase.storage.from("uploads").upload(path, file, { upsert: true });
      if (error) {
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        setSubmitting(false);
        return;
      }
      fileUrls.push(path);
    }

    const { error } = await supabase.from("service_applications").insert({
      user_id: user.id,
      service_type: openService.serviceType,
      form_data: formData as any,
      file_urls: fileUrls,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
    }
  };

  const totalRequired = openService
    ? openService.textFields.filter((f) => f.required).length + openService.fileFields.length
    : 0;

  return (
    <DashboardLayout title="NBA Anaocha" sidebarItems={anaochaSidebarItems}>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Apply for Services</h1>
          <p className="text-muted-foreground mt-1">
            Select a service below to apply. Ensure you have the required documents ready before proceeding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {services.map((service) => (
            <Card
              key={service.serviceType}
              className="shadow-card hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer"
              onClick={() => openModal(service)}
            >
              <CardContent className="p-6 flex flex-col h-full">
                {/* Icon + badge row */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl border ${service.color}`}>
                    {service.icon}
                  </div>
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    {service.textFields.length + service.fileFields.length} required
                  </Badge>
                </div>

                {/* Title + description */}
                <h3 className="font-heading text-base font-semibold text-card-foreground mb-1.5">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {service.description}
                </p>

                {/* Required items */}
                {(service.textFields.length > 0 || service.fileFields.length > 0) && (
                  <ul className="mt-4 space-y-1">
                    {service.textFields.slice(0, 2).map((f) => (
                      <li key={f.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                        {f.label}
                      </li>
                    ))}
                    {service.fileFields.slice(0, 2).map((f) => (
                      <li key={f.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                        {f.label}
                      </li>
                    ))}
                    {service.textFields.length + service.fileFields.length > 4 && (
                      <li className="text-xs text-muted-foreground/60 pl-4">
                        +{service.textFields.length + service.fileFields.length - 4} more...
                      </li>
                    )}
                  </ul>
                )}

                {/* CTA */}
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary group-hover:underline underline-offset-2">
                    {service.action}
                  </span>
                  <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Application Modal */}
      <Dialog open={!!openService} onOpenChange={(open) => !open && setOpenService(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-semibold text-foreground">Application Submitted</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your <span className="font-medium text-foreground">{openService?.title}</span> application has been received. The secretariat will review and get back to you.
                </p>
              </div>
              <Button onClick={() => setOpenService(null)} className="mt-2">Done</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {openService && (
                    <div className={`p-2.5 rounded-lg border ${openService.color}`}>
                      {openService.icon}
                    </div>
                  )}
                  <div>
                    <DialogTitle className="font-heading text-lg">{openService?.title}</DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{totalRequired} item{totalRequired !== 1 ? "s" : ""} required</p>
                  </div>
                </div>
              </DialogHeader>

              {openService && (
                <div className="space-y-5 mt-2">
                  {openService.textFields.length > 0 && (
                    <div className="space-y-4">
                      {openService.textFields.map((field) => (
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
                            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {openService.fileFields.length > 0 && (
                    <div className="space-y-3">
                      {openService.textFields.length > 0 && (
                        <div className="border-t pt-4">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Documents to Upload</p>
                        </div>
                      )}
                      {openService.textFields.length === 0 && (
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Documents to Upload</p>
                      )}
                      {openService.fileFields.map((field) => (
                        <div key={field.key}>
                          <label className="text-sm font-medium text-foreground">
                            {field.label} <span className="text-destructive">*</span>
                          </label>
                          <div className="mt-1.5">
                            {files[field.key] ? (
                              <div className="flex items-center gap-2 text-sm bg-muted/60 border border-border px-3 py-2.5 rounded-md">
                                <FileText className="h-4 w-4 text-accent shrink-0" />
                                <span className="truncate flex-1 text-foreground">{files[field.key].name}</span>
                                <button
                                  onClick={() => setFiles((prev) => { const n = { ...prev }; delete n[field.key]; return n; })}
                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => fileRefs.current[field.key]?.click()}
                                className="w-full flex flex-col items-center gap-1.5 border-2 border-dashed border-input rounded-md px-3 py-5 text-sm text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                              >
                                <Upload className="h-5 w-5" />
                                <span>Click to upload</span>
                                <span className="text-xs opacity-60">PDF, JPG, PNG accepted</span>
                              </button>
                            )}
                            <input
                              ref={(el) => { fileRefs.current[field.key] = el; }}
                              type="file"
                              accept={field.accept}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) setFiles((prev) => ({ ...prev, [field.key]: f }));
                              }}
                              className="hidden"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button onClick={handleSubmit} disabled={submitting} className="w-full mt-2">
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>
                    ) : (
                      `Submit Application`
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ApplyForServices;
