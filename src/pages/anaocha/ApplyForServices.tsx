import { useState, useRef } from "react";
import { Upload, X, Loader2, FileText, BookOpen, CreditCard, Stamp, ScrollText, ChevronRight, CheckCircle2, BadgeCheck, Car } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { anaochaSidebarItems } from "@/lib/sidebarItems";
import { SERVICE_FEES } from "@/lib/constants";

declare global { interface Window { PaystackPop: any; } }

const loadPaystack = (): Promise<void> =>
  new Promise((resolve) => {
    if (window.PaystackPop) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.onload = () => resolve();
    document.head.appendChild(s);
  });

const makeRef = () =>
  `ANAOCHA-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

interface ServiceConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  textFields: { key: string; label: string; required?: boolean }[];
  fileFields: { key: string; label: string; accept?: string }[];
  action: string;
  serviceType: string;
  /** When true the application is submitted without a Paystack payment. */
  free?: boolean;
}

const services: ServiceConfig[] = [
  {
    title: "NBA Diary",
    description: "Order your NBA Diary, a comprehensive resource with member details, court schedules, and branch information.",
    icon: <BookOpen className="h-6 w-6" />,
    color: "text-blue-600 bg-blue-50 border-blue-100",
    textFields: [
      { key: "full_name",        label: "Full Name",        required: true },
      { key: "phone",            label: "Phone Number",     required: true },
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
      { key: "full_name",      label: "Full Name",      required: true },
      { key: "phone",          label: "Phone Number",   required: true },
      { key: "year_of_call",   label: "Year of Call",   required: true },
      { key: "office_address", label: "Office Address", required: true },
    ],
    fileFields: [
      { key: "passport_photo", label: "Passport Photo", accept: "image/*" },
      { key: "signature",      label: "Signature",      accept: "image/*" },
    ],
    action: "Apply Now",
    serviceType: "nba_id_card",
  },
  {
    title: "Annual Practicing Certificate",
    description: "Apply for your Annual Practicing Certificate (APC). Upload your Bar Practicing Fee and branch dues receipts to proceed.",
    icon: <FileText className="h-6 w-6" />,
    color: "text-amber-600 bg-amber-50 border-amber-100",
    textFields: [
      { key: "year", label: "Practicing Year", required: true },
    ],
    fileFields: [
      { key: "bpf_receipt",         label: "Bar Practicing Fee (BPF) Receipt", accept: "image/*,.pdf" },
      { key: "branch_dues_receipt", label: "Branch Dues Receipt",               accept: "image/*,.pdf" },
    ],
    action: "Apply Now",
    serviceType: "apc",
  },
  {
    title: "Letter of Good Standing",
    description: "Request an official letter confirming your good standing as a member of the NBA Anaocha Branch.",
    icon: <BadgeCheck className="h-6 w-6" />,
    color: "text-green-600 bg-green-50 border-green-100",
    textFields: [
      { key: "purpose", label: "Purpose / Addressed To", required: true },
    ],
    fileFields: [],
    action: "Apply Now",
    serviceType: "letter_of_good_standing",
  },
  {
    title: "Stamp & Seal",
    description: "Request your official NBA Stamp & Seal. Upload your practicing fee and branch dues receipts to proceed.",
    icon: <Stamp className="h-6 w-6" />,
    color: "text-accent bg-accent/5 border-accent/10",
    textFields: [],
    fileFields: [
      { key: "practicing_fee_receipt", label: "Practicing Fee Receipt", accept: "image/*,.pdf" },
      { key: "branch_dues_receipt",    label: "Branch Dues Receipt",    accept: "image/*,.pdf" },
    ],
    action: "Apply Now",
    serviceType: "stamp_seal",
  },
  {
    title: "Title Document Front Page",
    description: "Apply for the NBA-endorsed front page for your title documents.",
    icon: <ScrollText className="h-6 w-6" />,
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    textFields: [],
    fileFields: [],
    action: "Apply Now",
    serviceType: "title_document_front_page",
  },
  {
    title: "NBA Vehicle Customized Plate Number",
    description: "Apply for the NBA customized vehicle plate number. Provide your NIN and phone number, and upload your vehicle/customized plate papers (receipt).",
    icon: <Car className="h-6 w-6" />,
    color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    textFields: [
      { key: "full_name", label: "Full Name",    required: true },
      { key: "phone",     label: "Phone Number", required: true },
      { key: "nin",       label: "NIN (National Identification Number)", required: true },
    ],
    fileFields: [
      { key: "vehicle_papers", label: "Vehicle / Customized Plate Papers (Receipt)", accept: "image/*,.pdf" },
    ],
    action: "Apply Now",
    serviceType: "nba_vehicle_plate",
  },
];

const ApplyForServices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openService, setOpenService] = useState<ServiceConfig | null>(null);
  const [formData, setFormData]       = useState<Record<string, string>>({});
  const [files, setFiles]             = useState<Record<string, File>>({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [paying, setPaying]           = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const openModal = (service: ServiceConfig) => {
    setOpenService(service);
    setFormData({});
    setFiles({});
    setSubmitted(false);
    setSubmitting(false);
  };

  const validate = (): boolean => {
    if (!openService) return false;
    for (const f of openService.textFields) {
      if (f.required && !formData[f.key]?.trim()) {
        toast({ title: "Required field missing", description: `${f.label} is required.`, variant: "destructive" });
        return false;
      }
    }
    for (const f of openService.fileFields) {
      if (!files[f.key]) {
        toast({ title: "Document required", description: `Please upload ${f.label}.`, variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  const doSubmit = async (reference: string | null) => {
    if (!user || !openService) return;
    setSubmitting(true);

    // 1. Upload any files
    const fileUrls: string[] = [];
    for (const [key, file] of Object.entries(files)) {
      const ext  = file.name.split(".").pop();
      const path = `${user.id}/${openService.serviceType}/${key}.${ext}`;
      const { error } = await supabase.storage.from("uploads").upload(path, file, { upsert: true });
      if (error) {
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        setSubmitting(false);
        return;
      }
      fileUrls.push(path);
    }

    // 2. Insert service application
    const { data: appData, error: appErr } = await supabase
      .from("service_applications")
      .insert({
        user_id:           user.id,
        service_type:      openService.serviceType,
        form_data:         formData as any,
        file_urls:         fileUrls,
        payment_reference: reference,
        payment_status:    reference ? "paid" : "not_required",
      })
      .select("id")
      .single();

    if (appErr) {
      toast({ title: "Submission failed", description: appErr.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // 3. Verify payment via Edge Function (writes to payments table), paid services only
    if (reference) {
      try {
        await supabase.functions.invoke("verify-payment", {
          body: { reference, user_id: user.id, entity_type: "service_application", entity_id: appData.id },
        });
      } catch {
        // Non-fatal: application is submitted; admin can reconcile via Paystack reference
        toast({
          title: "Payment recorded but verification pending",
          description: `Your application was submitted. Keep your reference: ${reference}. Contact the secretariat if payment is not reflected.`,
        });
      }
    }

    // 4. Notify admins
    {
      const { data: adminProfiles } = await supabase
        .from("profiles").select("user_id").eq("is_admin", true);
      if (adminProfiles?.length) {
        const { data: me } = await supabase
          .from("profiles").select("first_name, surname").eq("user_id", user.id).maybeSingle();
        const memberName = [me?.surname, me?.first_name].filter(Boolean).join(" ") || user.email;
        await supabase.from("notifications").insert(
          adminProfiles.map((p) => ({
            user_id: p.user_id,
            title:   `New Application: ${openService.title}`,
            message: `${memberName} has submitted a ${openService.title} application.`,
            type:    "application_update",
          }))
        );
      }
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  const handleFreeSubmit = async () => {
    if (!validate()) return;
    await doSubmit(null);
  };

  const handlePay = async () => {
    if (!validate() || !user || !openService) return;
    const fee = SERVICE_FEES[openService.serviceType] ?? 0;
    await loadPaystack();

    // Close the form dialog first so its overlay doesn't block the Paystack popup
    setPaying(true);

    window.PaystackPop.setup({
      key:      import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email:    user.email!,
      amount:   fee * 100,
      currency: "NGN",
      ref:      makeRef(),
      metadata: {
        custom_fields: [
          { display_name: "Service", variable_name: "service_type", value: openService.serviceType },
          { display_name: "Portal",  variable_name: "portal",       value: "NBA Anaocha" },
        ],
      },
      callback: (res: any) => {
        setPaying(false);
        doSubmit(res.reference);
      },
      onClose: () => {
        // Payment cancelled: reopen the form with data still intact
        setPaying(false);
        toast({ title: "Payment not completed", description: "Your application was not submitted. You can try again at any time.", variant: "destructive" });
      },
    }).openIframe();
  };

  return (
    <DashboardLayout title="NBA Anaocha" sidebarItems={anaochaSidebarItems}>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Apply for Services</h1>
          <p className="text-muted-foreground mt-1">
            Select a service below. Where a fee applies, payment is processed securely via Paystack before your application is submitted.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {services.map((service) => {
            const fee = SERVICE_FEES[service.serviceType];
            return (
              <Card
                key={service.serviceType}
                className="shadow-card hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer"
                onClick={() => openModal(service)}
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl border ${service.color}`}>{service.icon}</div>
                    <Badge variant="outline" className="text-xs font-semibold">
                      {service.free ? "Free" : `₦${(fee ?? 0).toLocaleString("en-NG")}`}
                    </Badge>
                  </div>
                  <h3 className="font-heading text-base font-semibold text-card-foreground mb-1.5">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {service.description}
                  </p>
                  {service.fileFields.length > 0 && (
                    <ul className="mt-4 space-y-1">
                      {service.fileFields.map((f) => (
                        <li key={f.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                          {f.label}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary group-hover:underline underline-offset-2">
                      {service.action}
                    </span>
                    <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Application + Payment Modal */}
      <Dialog open={!!openService && !paying} onOpenChange={(open) => !open && !submitting && !paying && setOpenService(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto">
                <BadgeCheck className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-semibold text-foreground">Application Submitted</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your <span className="font-medium text-foreground">{openService?.title}</span> application
                  has been received{openService?.free ? "" : " and payment confirmed"}. The secretariat will process it shortly.
                </p>
              </div>
              <Button onClick={() => setOpenService(null)}>Done</Button>
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
                    {openService?.free ? (
                      <p className="text-xs text-muted-foreground mt-0.5">No payment required</p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Fee:{" "}
                        <span className="font-semibold text-foreground">
                          ₦{(SERVICE_FEES[openService?.serviceType ?? ""] ?? 0).toLocaleString("en-NG")}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </DialogHeader>

              {openService && (
                <div className="space-y-5 mt-2">
                  {/* Text fields */}
                  {openService.textFields.map((field) => (
                    <div key={field.key}>
                      <label className="text-sm font-medium text-foreground">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </label>
                      <input
                        type="text"
                        value={formData[field.key] || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, [field.key]: e.target.value }))}
                        placeholder={field.label}
                        className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  ))}

                  {/* File fields */}
                  {openService.fileFields.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Documents Required
                      </p>
                      {openService.fileFields.map((field) => (
                        <div key={field.key}>
                          <label className="text-sm font-medium text-foreground">
                            {field.label} <span className="text-destructive">*</span>
                          </label>
                          <div className="mt-1.5">
                            {files[field.key] ? (
                              <div className="flex items-center gap-2 text-sm bg-muted/60 border border-border px-3 py-2.5 rounded-md">
                                <FileText className="h-4 w-4 text-accent shrink-0" />
                                <span className="truncate flex-1">{files[field.key].name}</span>
                                <button
                                  onClick={() => setFiles((p) => { const n = { ...p }; delete n[field.key]; return n; })}
                                  className="text-muted-foreground hover:text-destructive"
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
                                if (f) setFiles((p) => ({ ...p, [field.key]: f }));
                              }}
                              className="hidden"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Payment / submission info */}
                  <div className="bg-muted/40 border border-border rounded-md px-4 py-3 flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      {openService.free ? (
                        <>No payment is required for this service. Your application is submitted to the secretariat as soon as you click below.</>
                      ) : (
                        <>
                          A payment of{" "}
                          <span className="font-semibold text-foreground">
                            ₦{(SERVICE_FEES[openService.serviceType] ?? 0).toLocaleString("en-NG")}
                          </span>{" "}
                          will be collected securely via Paystack. Your application is only submitted after payment is confirmed.
                        </>
                      )}
                    </p>
                  </div>

                  <Button
                    onClick={openService.free ? handleFreeSubmit : handlePay}
                    disabled={submitting}
                    className="w-full gap-2"
                  >
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Processing...</>
                    ) : openService.free ? (
                      <>Submit Application</>
                    ) : (
                      <>Pay ₦{(SERVICE_FEES[openService.serviceType] ?? 0).toLocaleString("en-NG")} &amp; Submit</>
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
