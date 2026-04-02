import { FileText, BookOpen, CreditCard, Users, Phone, Home, FolderOpen, Search, BookMarked } from "lucide-react";

export const anaochaSidebarItems = [
  { label: "Dashboard", href: "/anaocha/dashboard", icon: <Home className="h-4 w-4" /> },
  { label: "Apply for Services", href: "/anaocha/apply", icon: <FileText className="h-4 w-4" /> },
  { label: "My Applications", href: "/anaocha/applications", icon: <BookOpen className="h-4 w-4" /> },
  { label: "Payment Receipts", href: "/anaocha/payments", icon: <CreditCard className="h-4 w-4" /> },
  { label: "Find a Member", href: "/anaocha/members", icon: <Users className="h-4 w-4" /> },
  { label: "Resources", href: "/resources", icon: <BookMarked className="h-4 w-4" /> },
  { label: "Contact Us", href: "/anaocha/contact", icon: <Phone className="h-4 w-4" /> },
];

export const remunerationSidebarItems = [
  { label: "Home", href: "/remuneration/dashboard", icon: <Home className="h-4 w-4" /> },
  { label: "Prepare a Document", href: "/remuneration/prepare", icon: <FileText className="h-4 w-4" /> },
  { label: "My Documents", href: "/remuneration/documents", icon: <FolderOpen className="h-4 w-4" /> },
  { label: "Payment History", href: "/remuneration/payments", icon: <CreditCard className="h-4 w-4" /> },
  { label: "Find a Document", href: "/remuneration/search", icon: <Search className="h-4 w-4" /> },
  { label: "Resources", href: "/resources", icon: <BookMarked className="h-4 w-4" /> },
];
