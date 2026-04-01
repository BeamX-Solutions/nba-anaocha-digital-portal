import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import nbaLogo from "@/assets/nba-logo.png";

const fields = [
  { key: "surname", label: "Surname", required: true },
  { key: "first_name", label: "First Name", required: true },
  { key: "middle_name", label: "Middle Name", required: false },
  { key: "year_of_call", label: "Year of Call", required: false, placeholder: "e.g. 2018" },
  { key: "phone", label: "Phone Number", required: true },
  { key: "office_address", label: "Office Address", required: false, fullWidth: true },
  { key: "branch", label: "Branch", required: false, defaultValue: "Anaocha" },
];

const CompleteProfile = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    surname: "", first_name: "", middle_name: "",
    year_of_call: "", phone: "", office_address: "", branch: "Anaocha",
  });

  useEffect(() => {
    if (!user) {
      navigate("/signin", { replace: true });
      return;
    }
    // Pre-fill from user metadata if coming from Google OAuth
    const meta = user.user_metadata ?? {};
    setForm((prev) => ({
      ...prev,
      first_name: meta.full_name?.split(" ")[0] ?? meta.first_name ?? "",
      surname: meta.full_name?.split(" ").slice(-1)[0] ?? meta.surname ?? "",
      phone: meta.phone ?? "",
    }));
  }, [user, navigate]);

  const handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const { error } = await supabase.from("profiles").upsert({
      user_id: user.id,
      email: user.email,
      surname: form.surname,
      first_name: form.first_name,
      middle_name: form.middle_name || null,
      year_of_call: form.year_of_call || null,
      phone: form.phone,
      office_address: form.office_address || null,
      branch: form.branch || "Anaocha",
    }, { onConflict: "user_id" });

    setLoading(false);

    if (error) {
      toast({ title: "Failed to save profile", description: error.message, variant: "destructive" });
      return;
    }

    await refreshProfile();
    toast({ title: "Welcome to NBA Anaocha!", description: "Your profile has been set up." });
    navigate("/anaocha/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 py-12 px-4">
      <div className="flex items-center gap-3 mb-8">
        <img src={nbaLogo} alt="NBA Anaocha" className="h-12 w-12" />
        <div>
          <h1 className="font-heading text-xl font-bold text-foreground">NBA Anaocha</h1>
          <p className="text-xs text-muted-foreground">Complete your member profile</p>
        </div>
      </div>

      <Card className="w-full max-w-lg shadow-card">
        <CardContent className="p-8">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-1">Complete Your Profile</h2>
          <p className="text-sm text-muted-foreground mb-6">
            We need a few more details to set up your membership. Fields marked <span className="text-destructive">*</span> are required.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.key} className={f.fullWidth ? "md:col-span-2" : ""}>
                  <label className="text-sm font-medium text-foreground">
                    {f.label}
                    {f.required && <span className="text-destructive ml-1">*</span>}
                  </label>
                  <input
                    type="text"
                    required={f.required}
                    value={form[f.key as keyof typeof form]}
                    onChange={handleChange(f.key)}
                    placeholder={f.placeholder ?? f.label}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
