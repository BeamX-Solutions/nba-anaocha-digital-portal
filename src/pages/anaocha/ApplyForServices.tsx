import { User, FileText, Bell, CreditCard, Info, Users, Phone, BookOpen } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

const services = [
  {
    title: "NBA Diary",
    description: "Order your NBA Diary — a comprehensive resource with member details, court schedules, and branch information.",
    icon: "📘",
    fields: ["Full Name", "Phone Number", "Delivery Address"],
    action: "Apply",
  },
  {
    title: "NBA ID Card",
    description: "Apply for your official NBA identification card. Upload passport photo and signature for processing.",
    icon: "🪪",
    fields: ["Full Name", "Phone Number", "Year of Call", "Office Address", "Passport Photo", "Signature"],
    action: "Apply",
  },
  {
    title: "Bar Identification Number",
    description: "Obtain your unique Bar Identification Number (BAIN) for practice verification and compliance.",
    icon: "🔖",
    fields: ["Upload receipt of 10% payment"],
    action: "Upload Receipt",
  },
  {
    title: "Stamp & Seal",
    description: "Request your official NBA Stamp & Seal for authenticating legal documents.",
    icon: "🔏",
    fields: ["Title Document Front Page", "Practicing Fee Receipt", "Branch Dues Receipt", "Stamp & Seal Payment Receipt"],
    action: "Request",
  },
];

const ApplyForServices = () => (
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
                  {service.fields.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              </div>
              <Button variant="accent">{service.action}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default ApplyForServices;
