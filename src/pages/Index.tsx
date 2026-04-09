import { Link, Navigate } from "react-router-dom";
import { ArrowRight, Scale, Monitor, Users, GraduationCap, Gavel, ShieldCheck, BookOpen, Heart, Megaphone, Trophy, Building2 } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import heroBg from "@/assets/hero-bg.jpg";
import aboutBranch from "@/assets/about-branch.jpg";
import newsTraining from "@/assets/news-training.jpg";
import newsLegal from "@/assets/news-legal.jpg";
import newsRights from "@/assets/news-rights.jpg";

const committees = [
  { icon: <ShieldCheck className="h-5 w-5" />, name: "Human Rights", desc: "Dedicated to legal aid and protecting fundamental liberties within our jurisdiction." },
  { icon: <Monitor className="h-5 w-5" />, name: "ICT & Tech", desc: "Driving digital transformation and innovation in legal practice.", featured: true },
  { icon: <Users className="h-5 w-5" />, name: "Women Forum", desc: "Promoting the interests of female practitioners and gender equity in law." },
  { icon: <GraduationCap className="h-5 w-5" />, name: "Young Lawyers", desc: "Empowering new entrants through mentorship and professional workshops." },
  { icon: <Scale className="h-5 w-5" />, name: "Remuneration", desc: "Ensuring fair compensation standards and financial compliance for all members." },
  { icon: <Gavel className="h-5 w-5" />, name: "Disciplinary", desc: "Upholding the highest standards of professional ethics and conduct." },
  { icon: <BookOpen className="h-5 w-5" />, name: "Journal", desc: "Publishing and curating legal research and academic contributions." },
  { icon: <Heart className="h-5 w-5" />, name: "Welfare", desc: "Supporting members' well-being and providing social assistance." },
  { icon: <Megaphone className="h-5 w-5" />, name: "Publicity", desc: "Managing the branch's public image and communication strategy." },
  { icon: <Trophy className="h-5 w-5" />, name: "Sports", desc: "Fostering camaraderie and fitness through sporting activities among members." },
  { icon: <Building2 className="h-5 w-5" />, name: "Bar Centre", desc: "Overseeing the maintenance and development of the NBA Anaocha Bar Centre." },
];

const newsArticles = [
  {
    tag: "Training",
    tagColor: "bg-orange-100 text-orange-700",
    title: "Employees Compensation Act Training",
    excerpt: "A comprehensive workshop for legal practitioners on the nuances of the recent amendments to the ECA.",
    date: "October 25, 2024",
    image: newsTraining,
  },
  {
    tag: "Development",
    tagColor: "bg-blue-100 text-blue-700",
    title: "CLE: Professional Ethics Series",
    excerpt: "The upcoming continuing legal education series will focus on cross-border litigation and ethical practice.",
    date: "September 10, 2024",
    image: newsLegal,
  },
  {
    tag: "Announcement",
    tagColor: "bg-green-100 text-green-700",
    title: "Branch Meeting & New Inductees",
    excerpt: "Join us as we welcome our newest members to the Family Bar and discuss the 2025 roadmap.",
    date: "August 29, 2024",
    image: newsRights,
  },
];

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero — full bleed image */}
      <section className="relative overflow-hidden min-h-[560px] md:min-h-[640px] flex items-center">
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative container py-20 md:py-32">
          <p className="text-white/60 text-[10px] font-bold tracking-[0.3em] uppercase mb-5">
            Institutional Excellence
          </p>
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] mb-4 max-w-3xl">
            Nigerian Bar Association
            <br />
            <em className="not-italic italic font-heading text-white/90">Anaocha Branch</em>
          </h1>
          <p className="text-white/65 italic text-base md:text-lg max-w-xl mb-10 leading-relaxed">
            Promoting the Rule of Law through unwavering professional integrity and community service.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/signin"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-md hover:bg-primary/90 transition-colors text-sm"
            >
              Access Portal <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#about"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-6 py-3 rounded-md hover:bg-white/10 transition-colors text-sm"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image with overlapping stat card */}
            <div className="relative">
              <img
                src={aboutBranch}
                alt="NBA Anaocha Branch"
                className="w-full rounded-xl shadow-xl object-cover aspect-[4/3]"
                loading="lazy"
              />
              <div className="absolute bottom-6 left-6 bg-background border border-border rounded-xl shadow-lg p-5 max-w-[180px]">
                <p className="font-heading text-3xl font-bold text-primary">2011</p>
                <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mt-1">Founded in Anaocha</p>
                <p className="text-xs text-muted-foreground mt-2 leading-snug">Established with a vision for legal excellence and professional camaraderie.</p>
              </div>
            </div>

            {/* Text */}
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
                The Family Bar
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-sm md:text-base">
                <p>
                  The NBA Anaocha Branch, fondly known as "The Family Bar," stands as a pillar of professional development and legal advocacy in Anambra State. Since our founding in <span className="text-foreground font-medium">2011</span>, we have cultivated an environment where legal practitioners thrive through mutual support and intellectual rigor.
                </p>
                <p>
                  Our commitment extends beyond the courtroom: we are dedicated to the preservation of the rule of law and the advancement of justice for all members of the Anaocha community.
                </p>
              </div>
              <div className="flex gap-6 mt-8">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Integrity</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Unity</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Committees */}
      <section id="committees" className="py-16 md:py-20 bg-muted/30 border-y border-border">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Branch Committees</h2>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground">Specialized Divisions Driving Our Mission</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {committees.map((c) => (
              <div
                key={c.name}
                className={`rounded-xl p-5 border transition-all ${
                  c.featured
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-border hover:border-primary/30 hover:shadow-md"
                }`}
              >
                <div className={`mb-3 ${c.featured ? "text-primary-foreground" : "text-muted-foreground"}`}>
                  {c.icon}
                </div>
                <p className={`font-heading font-semibold text-sm mb-1.5 ${c.featured ? "text-primary-foreground" : "text-foreground"}`}>
                  {c.name}
                </p>
                <p className={`text-xs leading-relaxed ${c.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Remuneration Portal Banner */}
      <section className="bg-primary">
        <div className="container py-14 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-3 leading-snug">
                Remuneration &amp; Compliance Portal
              </h2>
              <p className="text-primary-foreground/70 text-sm leading-relaxed mb-7 max-w-md">
                Secure access for members to track legal document fees, submit compliance reports, and manage professional standing.
              </p>
              <div className="flex gap-3">
                <Link
                  to="/signin"
                  className="inline-flex items-center justify-center bg-primary-foreground text-primary font-semibold px-5 py-2.5 rounded-md text-sm hover:bg-primary-foreground/90 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center border border-primary-foreground/30 text-primary-foreground font-semibold px-5 py-2.5 rounded-md text-sm hover:bg-primary-foreground/10 transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="font-heading text-6xl md:text-7xl font-bold text-accent leading-none">100%</p>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary-foreground/50 mt-2">Compliance Security</p>
            </div>
          </div>
        </div>
      </section>

      {/* Archival Resources / News */}
      <section className="container py-16 md:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-1">Archival Resources</h2>
            <p className="text-sm text-muted-foreground">Stay updated with the latest institutional developments</p>
          </div>
          <Link
            to="/resources"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {newsArticles.map((article) => (
            <div
              key={article.title}
              className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="relative">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-44 object-cover"
                  loading="lazy"
                />
                <span className={`absolute top-3 left-3 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded ${article.tagColor}`}>
                  {article.tag}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-heading text-sm font-semibold text-card-foreground mb-2 leading-snug">
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-3">
                  {article.excerpt}
                </p>
                <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">{article.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
