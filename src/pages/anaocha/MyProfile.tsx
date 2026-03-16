import { useState, useEffect } from "react";
import { User, FileText, Bell, CreditCard, Info, Users, Phone, BookOpen, Save } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

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

const profileSchema = z.object({
  surname: z.string().trim().max(100).optional(),
  first_name: z.string().trim().max(100).optional(),
  middle_name: z.string().trim().max(100).optional(),
  year_of_call: z.string().trim().max(10).optional(),
  phone: z.string().trim().max(20).optional(),
  office_address: z.string().trim().max(500).optional(),
  branch: z.string().trim().max(100).optional(),
});

const MyProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    surname: "", first_name: "", middle_name: "", year_of_call: "",
    phone: "", office_address: "", branch: "Anaocha", email: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single()
      .then(({ data }) => {
        if (data) {
          setForm({
            surname: data.surname ?? "",
            first_name: data.first_name ?? "",
            middle_name: data.middle_name ?? "",
            year_of_call: data.year_of_call ?? "",
            phone: data.phone ?? "",
            office_address: data.office_address ?? "",
            branch: data.branch ?? "Anaocha",
            email: data.email ?? user.email ?? "",
          });
        }
        setLoading(false);
      });
  }, [user]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = profileSchema.safeParse(form);
    if (!result.success) {
      toast({ title: "Validation error", description: result.error.errors[0]?.message, variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      surname: form.surname || null,
      first_name: form.first_name || null,
      middle_name: form.middle_name || null,
      year_of_call: form.year_of_call || null,
      phone: form.phone || null,
      office_address: form.office_address || null,
      branch: form.branch || null,
    }).eq("user_id", user!.id);

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated successfully!" });
    }
  };

  const fields = [
    { key: "surname", label: "Surname", required: true },
    { key: "first_name", label: "First Name", required: true },
    { key: "middle_name", label: "Middle Name" },
    { key: "year_of_call", label: "Year of Call" },
    { key: "phone", label: "Phone Number", required: true },
    { key: "office_address", label: "Office Address", fullWidth: true },
    { key: "branch", label: "Branch" },
  ];

  if (loading) {
    return (
      <DashboardLayout title="NBA Anaocha" sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="NBA Anaocha" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">View and update your member information.</p>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-4">
              {/* Email (read-only) */}
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="mt-1 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((f) => (
                  <div key={f.key} className={f.fullWidth ? "md:col-span-2" : ""}>
                    <label className="text-sm font-medium text-foreground">
                      {f.label}
                      {f.required && <span className="text-destructive ml-1">*</span>}
                    </label>
                    <input
                      type="text"
                      value={form[f.key as keyof typeof form]}
                      onChange={handleChange(f.key)}
                      placeholder={f.label}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}
              </div>

              <Button type="submit" disabled={saving} className="mt-2">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MyProfile;
