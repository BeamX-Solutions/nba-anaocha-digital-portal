import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { anaochaSidebarItems } from "@/lib/sidebarItems";

const ContactUs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ full_name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Required", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("contact_messages").insert({
      full_name: form.full_name,
      email: form.email,
      message: form.message,
      user_id: user?.id ?? null,
    });

    if (error) {
      setSubmitting(false);
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
      return;
    }

    // Email the secretariat
    await supabase.functions.invoke("send-email", {
      body: {
        type: "contact_message",
        name: form.full_name,
        email: form.email,
        message: form.message,
      },
    });

    // Send confirmation notification if user is logged in
    if (user) {
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Message Received — NBA Anaocha",
        message: `Thank you, ${form.full_name}. Your message has been received and will be attended to shortly by the branch secretariat.`,
        type: "contact",
      });
    }

    setSubmitting(false);
    setSubmitted(true);
    toast({ title: "Message sent!", description: "The secretariat will get back to you soon." });
  };

  return (
    <DashboardLayout title="NBA Anaocha" sidebarItems={anaochaSidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Contact Us</h1>
          <p className="text-muted-foreground mt-1">Get in touch with NBA Anaocha Branch secretariat.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Info */}
          <Card className="shadow-card lg:col-span-1">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-heading text-lg font-semibold text-foreground">Branch Contact</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">Address</p>
                  <p>NBA Anaocha Branch Secretariat,<br />Nnewi, Anambra State, Nigeria</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Website</p>
                  <p>www.nbaanaocha.org.ng</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Remuneration Portal</p>
                  <p>www.nbabranchremuneration.org.ng</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <Card className="shadow-card lg:col-span-2">
            <CardContent className="p-6">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                  <CheckCircle className="h-14 w-14 text-primary" />
                  <h3 className="font-heading text-xl font-semibold text-foreground">Message Sent!</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Your message has been received. The NBA Anaocha secretariat will respond to you shortly.
                  </p>
                  <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ full_name: "", email: "", message: "" }); }}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Full Name <span className="text-destructive">*</span></label>
                      <input
                        type="text"
                        value={form.full_name}
                        onChange={handleChange("full_name")}
                        placeholder="Your full name"
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Email <span className="text-destructive">*</span></label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={handleChange("email")}
                        placeholder="your@email.com"
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Message <span className="text-destructive">*</span></label>
                    <textarea
                      rows={6}
                      value={form.message}
                      onChange={handleChange("message")}
                      placeholder="Write your message here..."
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? "Sending..." : <><Send className="h-4 w-4 mr-2" />Send Message</>}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ContactUs;
