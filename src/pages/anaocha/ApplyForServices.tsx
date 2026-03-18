import { useState, useRef } from "react";
import { User, FileText, Bell, CreditCard, Info, Users, Phone, BookOpen, Upload, X, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const sidebarItems = [
  { label: "My Profile", href: "/anaocha/profile", icon: <User className="h-4 w-4" /> },
  { label: "Apply for Services", href: "/anaocha/apply", icon: <FileText className="h-4 w-4" /> },
  { label: "My Applications", href: "/anaocha/applications", icon: <BookOpen className="h-4 w-4" /> },
  { label: "Payments", href: "/anaocha/payments", icon: <CreditCard className="h-4 w-4" /> },
  { label: "About Branch", href: "/anaocha/about", icon: <Info className="h-4 w-4" /> },
  { label: "Committees", href: "/anaocha/committees", icon: <Users className="h-4 w-4" /> },
  { label: "Find a Member", href: "/anaocha/members", icon: <Users className="h-4 w-4" /> },
  { label: "Notifications", href: "/anaocha/notifications", icon: <Bell className="h-4 w-4" /> },
  { label: "Contact Us", href: "/anaocha/contact", icon: <Phone className="h-4 w-4" /> },
];

interface ServiceConfig {
  title: string;
  description: string;
  icon: string;
  textFields: { key: string; label: string; required?: boolean }[];
  fileFields: { key: string; label: string; accept?: string }[];
  action: string;
  serviceType: string;
}

const services: ServiceConfig[] = [
  {
    title: "NBA Diary",
    description: "Order your NBA Diary — a comprehensive resource with member details, court schedules, and branch information.",
    icon: "📘",
    textFields: [
      { key: "full_name", label: "Full Name", required: true },
      { key: "phone", label: "Phone Number", required: true },
      { key: "delivery_address", label: "Delivery Address", required: true },
    ],
    fileFields: [],
    action: "Apply",
    serviceType: "nba_diary",
  },
  {
    title: "NBA ID Card",
    description: "Apply for your official NBA identification card. Upload passport photo and signature for processing.",
    icon: "🪪",
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
    action: "Apply",
    serviceType: "nba_id_card",
  },
  {
    title: "Bar Identification Number",
    description: "Obtain your unique Bar Identification Number (BAIN) for practice verification and compliance.",
    icon: "🔖",
    textFields: [],
    fileFields: [
      { key: "payment_receipt", label: "Receipt of 10% Payment", accept: "image/*,.pdf" },
    ],
    action: "Upload Receipt",
    serviceType: "bain",
  },
  {
    title: "Stamp & Seal",
    description: "Request your official NBA Stamp & Seal for authenticating legal documents.",
    icon: "🔏",
    textFields: [],
    fileFields: [
      { key: "title_document", label: "Title Document Front Page", accept: "image/*,.pdf" },
      { key: "practicing_fee_receipt", label: "Practicing Fee Receipt", accept: "image/*,.pdf" },
      { key: "branch_dues_receipt", label: "Branch Dues Receipt", accept: "image/*,.pdf" },
      { key: "stamp_seal_receipt", label: "Stamp & Seal Payment Receipt", accept: "image/*,.pdf" },
    ],
    action: "Request",
    serviceType: "stamp_seal",
  },
];

const ApplyForServices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openService, setOpenService] = useState<ServiceConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [submitting, setSubmitting] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const openModal = (service: ServiceConfig) => {
    setOpenService(service);
    setFormData({});
    setFiles({});
  };

  const handleSubmit = async () => {
    if (!user || !openService) return;

    // Validate required text fields
    for (const field of openService.textFields) {
      if (field.required && !formData[field.key]?.trim()) {
        toast({ title: "Required", description: `${field.label} is required.`, variant: "destructive" });
        return;
      }
    }

    // Validate file fields
    for (const field of openService.fileFields) {
      if (!files[field.key]) {
        toast({ title: "Required", description: `Please upload ${field.label}.`, variant: "destructive" });
        return;
      }
    }

    setSubmitting(true);

    // Upload files
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

    // Insert application
    const { error } = await supabase.from("service_applications").insert({
      user_id: user.id,
      service_type: openService.serviceType,
      form_data: formData as any,
      file_urls: fileUrls,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Application submitted!", description: `Your ${openService.title} application has been received.` });
      setOpenService(null);
    }
  };

  return (
    <DashboardLayout title="NBA Anaocha" sidebarItems={sidebarItems}>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Apply for Services</h1>
          <p className="text-muted-foreground mt-1">
            Select a service to apply. Upload required documents and complete payment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <Card key={service.title} className="shadow-card hover:shadow-lg transition-shadow border-l-4 border-l-accent">
              <CardContent className="p-6">
                <div className="text-3xl mb-3">{service.icon}</div>
                <h3 className="font-heading text-xl font-semibold text-card-foreground mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-foreground mb-1">Required:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {service.textFields.map((f) => <li key={f.key}>• {f.label}</li>)}
                    {service.fileFields.map((f) => <li key={f.key}>• {f.label} (upload)</li>)}
                  </ul>
                </div>
                <Button variant="accent" onClick={() => openModal(service)}>{service.action}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Application Modal */}
      <Dialog open={!!openService} onOpenChange={(open) => !open && setOpenService(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {openService?.icon} {openService?.title}
            </DialogTitle>
          </DialogHeader>

          {openService && (
            <div className="space-y-4 mt-2">
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
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}

              {openService.fileFields.map((field) => (
                <div key={field.key}>
                  <label className="text-sm font-medium text-foreground">{field.label}</label>
                  <div className="mt-1">
                    {files[field.key] ? (
                      <div className="flex items-center gap-2 text-sm text-foreground bg-muted px-3 py-2 rounded-md">
                        <FileText className="h-4 w-4 text-accent" />
                        <span className="truncate flex-1">{files[field.key].name}</span>
                        <button onClick={() => setFiles((prev) => { const n = { ...prev }; delete n[field.key]; return n; })}>
                          <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileRefs.current[field.key]?.click()}
                        className="w-full flex items-center gap-2 justify-center border-2 border-dashed border-input rounded-md px-3 py-4 text-sm text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        Click to upload
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

              <Button onClick={handleSubmit} disabled={submitting} className="w-full mt-4">
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : `Submit ${openService.title} Application`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ApplyForServices;
