import { useState, useEffect } from "react";
import { User, FileText, Bell, CreditCard, Info, Users, Phone, BookOpen } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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

const serviceCards = [
  { title: "NBA Diary", description: "Order your NBA Diary for the current year with member details and schedules.", icon: "📘", action: "Apply" },
  { title: "NBA ID Card", description: "Apply for your official NBA identification card with photo and credentials.", icon: "🪪", action: "Apply" },
  { title: "Bar Identification Number", description: "Obtain your unique Bar Identification Number for practice verification.", icon: "🔖", action: "Upload Receipt" },
  { title: "Stamp & Seal", description: "Request your official NBA Stamp & Seal for document authentication.", icon: "🔏", action: "Request" },
];

const AnaochaDashboard = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("first_name").eq("user_id", user.id).single()
      .then(({ data }) => {
        if (data?.first_name) setFirstName(data.first_name);
      });
  }, [user]);

  return (
  <DashboardLayout title="NBA Anaocha" sidebarItems={sidebarItems}>
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Welcome, {firstName || "Member"}</h1>
        <p className="text-muted-foreground mt-1">Manage your NBA Anaocha membership and services.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {serviceCards.map((card) => (
          <Card key={card.title} className="shadow-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl mb-3">{card.icon}</div>
                  <h3 className="font-heading text-lg font-semibold text-card-foreground">{card.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                </div>
              </div>
              <Button variant="accent" size="sm" className="mt-4" asChild>
                <Link to="/anaocha/apply">{card.action}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

};

export default AnaochaDashboard;
