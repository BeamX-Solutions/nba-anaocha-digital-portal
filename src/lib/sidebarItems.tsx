import { FileText, BookOpen, CreditCard, Users, Phone, Home, BookMarked, Scale, Newspaper } from "lucide-react";

export const anaochaSidebarItems = [
  { label: "Dashboard",             href: "/anaocha/dashboard",    icon: <Home className="h-4 w-4" /> },
  { label: "Apply for Services",    href: "/anaocha/apply",        icon: <FileText className="h-4 w-4" /> },
  { label: "My Applications",      href: "/anaocha/applications", icon: <BookOpen className="h-4 w-4" /> },
  { label: "Payment History",      href: "/anaocha/payments",     icon: <CreditCard className="h-4 w-4" /> },
  { label: "Find a Member",        href: "/anaocha/members",      icon: <Users className="h-4 w-4" /> },
  { label: "Blog",                 href: "/blog",                 icon: <Newspaper className="h-4 w-4" /> },
  { label: "Resources",            href: "/resources",            icon: <BookMarked className="h-4 w-4" /> },
  { label: "Contact Us",           href: "/anaocha/contact",      icon: <Phone className="h-4 w-4" /> },
  {
    label: "Remuneration Portal",
    href: import.meta.env.VITE_REMUNERATION_PORTAL_URL || "#",
    icon: <Scale className="h-4 w-4" />,
    external: true,
  },
];
