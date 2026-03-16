import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const SignUp = () => {
  const [form, setForm] = useState({
    email: "", password: "", surname: "", first_name: "", middle_name: "",
    year_of_call: "", phone: "", office_address: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          surname: form.surname,
          first_name: form.first_name,
          middle_name: form.middle_name,
          year_of_call: form.year_of_call,
          phone: form.phone,
          office_address: form.office_address,
        },
      },
    });

    if (error) {
      setLoading(false);
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      return;
    }

    setLoading(false);
    toast({ title: "Account created!", description: "Please check your email to verify your account." });
    navigate("/signin");
  };

  const fields = [
    { key: "surname", label: "Surname", type: "text", required: true },
    { key: "first_name", label: "First Name", type: "text", required: true },
    { key: "middle_name", label: "Middle Name", type: "text", required: false },
    { key: "year_of_call", label: "Year of Call", type: "text", required: false },
    { key: "phone", label: "Phone Number", type: "tel", required: true },
    { key: "office_address", label: "Office Address", type: "text", required: false },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "password", label: "Password", type: "password", required: true },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center bg-muted/30 py-12 px-4">
        <Card className="w-full max-w-lg shadow-card">
          <CardContent className="p-8">
            <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Create Account</h1>
            <p className="text-sm text-muted-foreground mb-6">Join NBA Anaocha Branch as a member</p>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((f) => (
                  <div key={f.key} className={f.key === "office_address" ? "md:col-span-2" : ""}>
                    <label className="text-sm font-medium text-foreground">{f.label}</label>
                    <input
                      type={f.type}
                      required={f.required}
                      value={form[f.key as keyof typeof form]}
                      onChange={handleChange(f.key)}
                      placeholder={f.label}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/signin" className="text-primary font-semibold hover:underline">Sign In</Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default SignUp;
