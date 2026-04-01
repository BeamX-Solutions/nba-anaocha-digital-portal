import { Scale, ShieldCheck, BookOpen } from "lucide-react";
import RemunerationLayout from "@/components/RemunerationLayout";
import { Card, CardContent } from "@/components/ui/card";
import { remunerationSidebarItems } from "@/lib/sidebarItems";

const highlights = [
  {
    icon: <Scale className="h-7 w-7 text-accent" />,
    title: "Remuneration Order 2023 Compliance",
    body: "Every document generated through this portal is structured to comply with the Legal Practitioners' Remuneration Order 2023, ensuring legal practitioners meet their statutory obligations.",
  },
  {
    icon: <ShieldCheck className="h-7 w-7 text-accent" />,
    title: "BAIN — Bar Identification Number",
    body: "All finalized documents receive a unique Bar Identification Number (BAIN) at the footer, serving as proof of compliance and enabling verification by any party.",
  },
  {
    icon: <BookOpen className="h-7 w-7 text-accent" />,
    title: "AI-Powered Document Drafting",
    body: "Lawyers can generate compliant document drafts instantly using the AI-powered smart form, or upload their own precedents for automatic reformatting and compliance.",
  },
];

const RemunerationAbout = () => (
  <RemunerationLayout sidebarItems={remunerationSidebarItems}>
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">About the Remuneration Portal</h1>
        <p className="text-muted-foreground mt-1">
          The official NBA Anaocha Branch portal for legal document preparation and remuneration compliance.
        </p>
      </div>

      {/* Mission */}
      <Card className="shadow-card border-t-4 border-t-accent">
        <CardContent className="p-6 space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            The NBA Anaocha Remuneration Portal was established by the NBA Anaocha Branch Remuneration Committee to bring
            structure, transparency and accountability to legal document preparation and remuneration compliance in
            Anambra State. The portal enables every legal practitioner to generate court-ready, compliant legal documents
            from any location — quickly, accurately and in accordance with the law.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The portal is powered by the <strong>Legal Practitioners' Remuneration Order 2023</strong> and is the
            authoritative tool for ensuring that property transaction documents, powers of attorney, mortgages and
            other instruments are properly rated, structured and stamped.
          </p>
        </CardContent>
      </Card>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {highlights.map((h) => (
          <Card key={h.title} className="shadow-card hover:shadow-lg transition-shadow">
            <CardContent className="p-5 space-y-3">
              {h.icon}
              <h3 className="font-heading text-base font-semibold text-card-foreground">{h.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{h.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Contact the Remuneration Committee</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Portal</p>
              <p>www.nbabranchremuneration.org.ng</p>
            </div>
            <div>
              <p className="font-medium text-foreground">NBA Anaocha Main Portal</p>
              <p>www.nbaanaocha.org.ng</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Branch Address</p>
              <p>NBA Anaocha Branch Secretariat,<br />Nnewi, Anambra State, Nigeria</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </RemunerationLayout>
);

export default RemunerationAbout;
