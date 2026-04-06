import { Link, Navigate } from "react-router-dom";
import { Scale, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import lawyersCollage from "@/assets/lawyers-collage.jpg";
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
      <section className="relative bg-primary overflow-hidden">
        <div className="container py-12 md:py-20">
          <p className="text-center text-primary-foreground/70 tracking-[0.25em] uppercase text-sm mb-4 font-body">
            Promoting the Rule of Law
          </p>
          <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-primary-foreground text-center leading-tight mb-8">
            Nigerian Bar Association
            <br />
            <span className="text-gradient-gold">Anaocha Branch</span>
          </h1>
          <div className="max-w-3xl mx-auto">
            <img
              src={lawyersCollage}
              alt="NBA Anaocha Branch lawyers and legal events"
              className="w-full rounded-lg shadow-xl"
              width={1200}
              height={512}
            />
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="container py-16 md:py-24">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-10 text-center">
          About Us
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p>
              The Nigerian Bar Association Anaocha Branch, popularly known as the "Family Bar," is one of the youngest yet most dynamic branches of the Nigerian Bar Association, officially inaugurated in May 2014.
            </p>
            <p>
              Since its establishment, the branch has grown into a vibrant community of legal practitioners committed to promoting the rule of law, upholding professional ethics, and advancing justice within Anaocha and beyond. As part of the broader NBA network, the branch provides a platform for collaboration, knowledge sharing, and the continuous development of its members.
            </p>
            <p>
              Driven by a culture of inclusiveness and excellence, the NBA Anaocha Branch actively engages in legal advocacy, capacity-building programmes, and community-focused initiatives. The branch regularly organizes trainings, sensitisation programmes, and professional development activities to keep members aligned with evolving legal standards and practices.
            </p>
            <p>
              With a strong emphasis on member welfare, unity, and service, the branch continues to position itself as a progressive force dedicated to strengthening the legal profession and contributing meaningfully to society.
            </p>
          </div>
          <div>
            <img
              src={aboutBranch}
              alt="NBA Anaocha Branch members at a meeting"
              className="rounded-lg shadow-lg w-full object-cover"
              loading="lazy"
              width={800}
              height={600}
            />
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
