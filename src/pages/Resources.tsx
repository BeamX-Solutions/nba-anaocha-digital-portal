import { FileText, BookOpen, Scale, Download, ExternalLink } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { anaochaSidebarItems } from "@/lib/sidebarItems";

const resources = [
  {
    category: "Legal Compliance",
    icon: <Scale className="h-6 w-6 text-primary" />,
    items: [
      {
        title: "Legal Practitioners' Remuneration Order 2023",
        description: "The authoritative guide on fees for legal work including property transactions in Nigeria.",
        type: "PDF",
        href: "#",
      },
      {
        title: "NBA Rules of Professional Conduct",
        description: "Rules governing the professional conduct of legal practitioners in Nigeria.",
        type: "PDF",
        href: "#",
      },
    ],
  },
  {
    category: "Branch Documents",
    icon: <FileText className="h-6 w-6 text-primary" />,
    items: [
      {
        title: "NBA Anaocha Branch Constitution",
        description: "The governing document of the NBA Anaocha Branch, outlining its structure and operations.",
        type: "PDF",
        href: "#",
      },
      {
        title: "Branch Annual Report",
        description: "Yearly report on the activities, achievements and financial standing of NBA Anaocha Branch.",
        type: "PDF",
        href: "#",
      },
    ],
  },
  {
    category: "Practice Guides",
    icon: <BookOpen className="h-6 w-6 text-primary" />,
    items: [
      {
        title: "Guide to Obtaining Your BAIN",
        description: "Step-by-step instructions for applying for your Bar Identification Number.",
        type: "Guide",
        href: "#",
      },
      {
        title: "Stamp & Seal Application Guide",
        description: "How to apply for and renew your official NBA Stamp and Seal.",
        type: "Guide",
        href: "#",
      },
      {
        title: "Remuneration Portal User Manual",
        description: "How to use the NBA Anaocha Remuneration Portal to prepare and submit legal documents.",
        type: "Guide",
        href: "#",
      },
    ],
  },
];

const Resources = () => (
  <DashboardLayout title="NBA Anaocha" sidebarItems={anaochaSidebarItems}>
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-4xl font-bold text-foreground">Resources</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Official documents, guides, and references for NBA Anaocha Branch members.
        </p>
      </div>

      {resources.map((section) => (
        <section key={section.category}>
          <div className="flex items-center gap-3 mb-4">
            {section.icon}
            <h2 className="font-heading text-2xl font-semibold text-foreground">{section.category}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {section.items.map((item) => (
              <Card key={item.title} className="shadow-card hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-heading text-base font-semibold text-card-foreground leading-snug flex-1">{item.title}</h3>
                    <span className="ml-2 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium flex-shrink-0">{item.type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1 mb-4">{item.description}</p>
                  <Button variant="outline" size="sm" asChild className="w-fit">
                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                      {item.type === "PDF" ? (
                        <><Download className="h-3.5 w-3.5 mr-1.5" />Download</>
                      ) : (
                        <><ExternalLink className="h-3.5 w-3.5 mr-1.5" />View Guide</>
                      )}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  </DashboardLayout>
);

export default Resources;
