import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import nbaLogo from "@/assets/nba-logo.png";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="container py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <img src={nbaLogo} alt="NBA Anaocha" className="h-10 w-10" />
            <div>
              <p className="font-heading font-bold text-primary-foreground leading-tight">NBA Anaocha Branch</p>
              <p className="text-[10px] text-primary-foreground/50 tracking-wide">Anambra State, Nigeria</p>
            </div>
          </div>
          <p className="text-sm text-primary-foreground/60 leading-relaxed">
            The Nigerian Bar Association, Anaocha Branch — promoting the rule of law, professional ethics, and justice since 2011.
          </p>
          {/* Social links */}
          <div className="flex gap-3 mt-5">
            {[
              { icon: <Facebook className="h-4 w-4" />, href: "#" },
              { icon: <Twitter className="h-4 w-4" />, href: "#" },
              { icon: <Instagram className="h-4 w-4" />, href: "#" },
              { icon: <Linkedin className="h-4 w-4" />, href: "#" },
            ].map((s, i) => (
              <a
                key={i}
                href={s.href}
                className="h-8 w-8 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground hover:border-primary-foreground/50 transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-heading font-semibold text-sm mb-4 text-accent tracking-wide">Quick Links</h4>
          <ul className="space-y-2.5">
            {[
              { label: "Home", to: "/" },
              { label: "About the Branch", to: "/#about" },
              { label: "Committees", to: "/#committees" },
              { label: "Remuneration Portal", to: "/remuneration/about" },
              { label: "Member Directory", to: "/anaocha/find-member" },
              { label: "Apply for Services", to: "/anaocha/apply" },
              { label: "Resources", to: "/resources" },
            ].map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-heading font-semibold text-sm mb-4 text-accent tracking-wide">Contact Us</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-primary-foreground/80">+234 000 000 0000</p>
                <p className="text-xs text-primary-foreground/40">Mon – Fri, 9am – 5pm</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-primary-foreground/80">info@nbaanaocha.org.ng</p>
                <p className="text-xs text-primary-foreground/40">General enquiries</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-primary-foreground/80 leading-snug">
                Charles & N. Osondu Bar Centre,<br />
                Anaocha LGA, Anambra State, Nigeria
              </p>
            </li>
          </ul>
        </div>

        {/* Portal Access */}
        <div>
          <h4 className="font-heading font-semibold text-sm mb-4 text-accent tracking-wide">Portal Access</h4>
          <p className="text-sm text-primary-foreground/60 mb-5 leading-relaxed">
            Members can sign in to access branch services, manage applications, and use the Remuneration Portal.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              to="/signin"
              className="inline-flex items-center justify-center bg-primary-foreground text-primary font-semibold px-4 py-2 rounded-md text-sm hover:bg-primary-foreground/90 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center border border-primary-foreground/20 text-primary-foreground font-semibold px-4 py-2 rounded-md text-sm hover:bg-primary-foreground/10 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-primary-foreground/40">
        <p>© {new Date().getFullYear()} NBA Anaocha Branch. All Rights Reserved.</p>
        <p>Promoting the Rule of Law since 2011.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
