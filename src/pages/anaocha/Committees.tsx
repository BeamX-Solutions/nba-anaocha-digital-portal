import { User, FileText, Bell, CreditCard, Info, Users, Phone, BookOpen } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";

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

const committees = [
  "NBA Anaocha Human-Right Committee",
  "NBA Anaocha ICT Committee",
  "NBA Anaocha Young Lawyers Forum",
  "NBA Anaocha Women Forum",
  "NBA Anaocha Disciplinary Committee",
  "NBA Anaocha Remuneration Committee",
  "NBA Anaocha Journal Committee",
  "NBA Anaocha Welfare Committee",
  "NBA Anaocha Publicity Committee",
  "NBA Anaocha Sports Committee",
  "NBA Anaocha Bar Center Committee",
];

const Committees = () => (
  <DashboardLayout title="NBA Anaocha" sidebarItems={sidebarItems}>
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Committees</h1>
        <p className="text-muted-foreground mt-1">NBA Anaocha Branch Committees</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {committees.map((name) => (
          <Card key={name} className="shadow-card hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading text-sm font-semibold text-card-foreground">{name}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default Committees;
