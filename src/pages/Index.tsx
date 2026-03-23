import { Link } from "react-router-dom";
import { Scale, FileText, Users, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroBg from "@/assets/hero-bg.jpg";

const featureCards = [
  {
    icon: <Users className="h-8 w-8" />,
    title: "Membership Services",
    description: "Manage your profile, apply for ID cards, stamps, seals, and more.",
    link: "/anaocha/about",
  },
  {
    icon: <Scale className="h-8 w-8" />,
    title: "Remuneration Compliance",
    description: "Prepare documents and comply with Remuneration Order 2023.",
    link: "/remuneration/about",
  },
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: "Resources & Updates",
    description: "Access branch resources, publications, and stay updated.",
    link: "/resources",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[520px] flex items-center">
        <img
          src={heroBg}
          alt="Nigerian legal institution"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="container relative z-10 py-20">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              NBA Anaocha
              <br />
              <span className="text-gradient-gold">Digital Portal</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 font-body max-w-lg">
              Managing Members. Enforcing Standards. Enabling Structured Legal Payments.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/signup">
                  Join NBA Anaocha
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/remuneration/about">Enter Remuneration Portal</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="container py-16 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureCards.map((card) => (
            <Card
              key={card.title}
              className="shadow-card hover:shadow-xl hover:-translate-y-1 transition-all duration-250 border-t-4 border-t-accent bg-card"
            >
              <CardContent className="p-6">
                <div className="text-primary mb-4">{card.icon}</div>
                <h3 className="font-heading text-xl font-semibold text-card-foreground mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
                <Link
                  to={card.link}
                  className="text-sm font-semibold text-primary hover:text-accent transition-colors inline-flex items-center gap-1"
                >
                  Learn More <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Info */}
      <section className="bg-secondary/50 py-16">
        <div className="container text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
            Two Portals, One Platform
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
            The NBA Anaocha Branch Portal and Remuneration Portal work together to serve our members efficiently.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="shadow-card hover:shadow-xl hover:-translate-y-1 transition-all duration-250 border-l-4 border-l-primary">
              <CardContent className="p-6 text-left">
                <FileText className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-heading text-lg font-semibold mb-2">NBA Anaocha Portal</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Apply for NBA Diary, ID Card, Bar Identification Number, Stamp & Seal, and manage your membership.
                </p>
                <Button variant="default" size="sm" asChild>
                  <Link to="/anaocha/about">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="shadow-card hover:shadow-xl hover:-translate-y-1 transition-all duration-250 border-l-4 border-l-accent">
              <CardContent className="p-6 text-left">
                <Scale className="h-8 w-8 text-accent mb-3" />
                <h3 className="font-heading text-lg font-semibold mb-2">Remuneration Portal</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Prepare legal documents, ensure compliance with Remuneration Order 2023, and manage payments.
                </p>
                <Button variant="accent" size="sm" asChild>
                  <Link to="/remuneration/about">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
