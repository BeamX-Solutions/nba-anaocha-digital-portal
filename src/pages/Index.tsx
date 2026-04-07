import { Link, Navigate } from "react-router-dom";
import { Scale, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import heroBg from "@/assets/hero-bg.jpg";
import aboutBranch from "@/assets/about-branch.png";
import newsTraining from "@/assets/news-training.jpg";
import newsLegal from "@/assets/news-legal.jpg";
import newsRights from "@/assets/news-rights.jpg";

const newsArticles = [
  {
    title: "Anaocha Lawyers Gather for Insightful Training on Employees Compensation Act",
    excerpt:
      "The training, held at the Charles & N. Osondu Bar Centre, brought together distinguished members and experts to discuss practical implementation of workplace safety laws and social protection mechanisms.",
    image: newsTraining,
  },
  {
    title: "NBA Anaocha Branch Advances Professional Development Through Specialized Legal Training",
    excerpt:
      "NBA Anaocha Branch continues to demonstrate leadership in professional development through impactful programmes, including mentorship and training initiatives that promote excellence.",
    image: newsLegal,
  },
  {
    title: "Family Bar Hosts High-Impact Training Focused on Workplace Rights Awareness",
    excerpt:
      "The branch also contributes to national NBA initiatives, participating in key policy engagements and compliance activities that strengthen the legal profession and uphold standards across Nigeria's legal community.",
    image: newsRights,
  },
];

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/anaocha/dashboard" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[520px] md:min-h-[620px] flex items-center">
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-primary/75" />
        <div className="relative container py-20 md:py-32 flex flex-col items-center text-center">
          <p className="text-primary-foreground/70 tracking-[0.25em] uppercase text-xs md:text-sm mb-5 font-body">
            Promoting the Rule of Law
          </p>
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6 max-w-4xl">
            Nigerian Bar Association
            <br />
            <span className="text-gradient-gold">Anaocha Branch</span>
          </h1>
          <p className="text-primary-foreground/70 text-base md:text-lg max-w-2xl mb-10 font-body leading-relaxed">
            A vibrant community of legal practitioners committed to justice, professional excellence, and the rule of law in Anaocha and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="hero" size="lg" asChild>
              <Link to="/signin">Access Portal <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" className="bg-white/10 text-white border border-white/30 hover:bg-white/20" asChild>
              <a href="#about">Learn More</a>
            </Button>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="py-16 md:py-24 overflow-hidden">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image */}
            <div className="relative">
              <div className="absolute -inset-4 bg-accent/10 rounded-2xl -z-10" />
              <img
                src={aboutBranch}
                alt="NBA Anaocha Branch"
                className="w-full rounded-xl shadow-xl"
                loading="lazy"
              />
            </div>

            {/* Text */}
            <div>
              <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-3">Who We Are</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
                The Family Bar
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  The Nigerian Bar Association Anaocha Branch, popularly known as the <span className="text-foreground font-medium">"Family Bar,"</span> is one of the youngest yet most dynamic branches of the Nigerian Bar Association, officially inaugurated in <span className="text-foreground font-medium">May 2014.</span>
                </p>
                <p>
                  Since its establishment, the branch has grown into a vibrant community of legal practitioners committed to promoting the rule of law, upholding professional ethics, and advancing justice within Anaocha and beyond.
                </p>
                <p>
                  Driven by a culture of inclusiveness and excellence, the branch actively engages in legal advocacy, capacity-building programmes, and community-focused initiatives — regularly organizing trainings and professional development activities to keep members aligned with evolving legal standards.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                  <p className="font-heading text-2xl font-bold text-primary">2014</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Year Founded</p>
                </div>
                <div className="bg-accent/5 border border-accent/10 rounded-xl p-4">
                  <p className="font-heading text-2xl font-bold text-accent">11</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Active Committees</p>
                </div>
              </div>

              <Button className="mt-8" asChild>
                <Link to="/signin">Join the Branch <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Committees */}
      <section className="bg-muted/40 border-y border-border py-16">
        <div className="container">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2 text-center">Our Committees</h2>
          <p className="text-muted-foreground text-center mb-10">Standing committees of the NBA Anaocha Branch</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
            {[
              "Human Rights Committee",
              "ICT Committee",
              "Young Lawyers Forum",
              "Women Forum",
              "Disciplinary Committee",
              "Remuneration Committee",
              "Journal Committee",
              "Welfare Committee",
              "Publicity Committee",
              "Sports Committee",
              "Bar Center Committee",
            ].map((committee) => (
              <div key={committee} className="flex items-center gap-3 bg-background border border-border rounded-lg px-4 py-3 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-accent shrink-0" />
                <span className="text-sm font-medium text-foreground">NBA Anaocha {committee}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Remuneration Portal Banner */}
      <section className="bg-primary">
        <div className="container py-14 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Remuneration Portal
          </h2>
          <p className="text-primary-foreground/80 max-w-3xl mx-auto mb-8 font-body">
            The Official Remuneration Portal of the Nigerian Bar Association, Anaocha Branch. Manage property transactions, generate compliant legal documents, verify fee compliance, and track professional remuneration — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/signin">Sign In <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link to="/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Resources / News */}
      <section className="container py-16 md:py-24">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground text-center mb-2">
          Resources
        </h2>
        <p className="text-muted-foreground text-center mb-10">
          Latest news about NBA Anaocha Branch
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newsArticles.map((article) => (
            <Card
              key={article.title}
              className="shadow-card hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden"
            >
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-48 object-cover"
                loading="lazy"
                width={640}
                height={512}
              />
              <CardContent className="p-5">
                <h3 className="font-heading text-base font-semibold text-card-foreground mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                  {article.excerpt}
                </p>
                <Link
                  to="/resources"
                  className="text-sm font-semibold text-primary hover:text-accent transition-colors inline-flex items-center gap-1"
                >
                  Read More <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>


<Footer />
    </div>
  );
};

export default Index;
