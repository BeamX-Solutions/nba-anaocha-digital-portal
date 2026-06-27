import { Link } from "react-router-dom";
import { Phone, Globe, MapPin, Mail, Facebook, Instagram, Linkedin } from "lucide-react";
import nbaLogo from "@/assets/nba-logo.png";
import { BRANCH_CONTACT } from "@/lib/constants";

// X (formerly Twitter) brand logo: lucide-react has no official X icon.
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

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
            The Nigerian Bar Association, Anaocha Branch, promoting the rule of law, professional ethics, and justice since 2014.
          </p>
          {/* Social links */}
          <div className="flex gap-3 mt-5">
            {[
              { icon: <Facebook className="h-4 w-4" />, href: "#" },
              { icon: <XIcon className="h-3.5 w-3.5" />, href: "#" },
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
          <h4 className="font-heading font-semibold text-sm mb-4 text-accent tracking-wide">Branch Secretariat</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-primary-foreground/80 leading-snug">
                {BRANCH_CONTACT.addressLines.map((line, i) => (
                  <span key={i}>{line}{i < BRANCH_CONTACT.addressLines.length - 1 && <br />}</span>
                ))}
              </p>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <div>
                {BRANCH_CONTACT.phones.map((phone) => (
                  <p key={phone} className="text-sm text-primary-foreground/80">
                    <a href={`tel:${phone}`} className="hover:text-accent transition-colors">{phone}</a>
                  </p>
                ))}
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-primary-foreground/80">
                <a href={`mailto:${BRANCH_CONTACT.email}`} className="hover:text-accent transition-colors">{BRANCH_CONTACT.email}</a>
              </p>
            </li>
            <li className="flex items-start gap-3">
              <Globe className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-primary-foreground/80">{BRANCH_CONTACT.website}</p>
            </li>
          </ul>
        </div>

        {/* Portal Access */}
        <div>
          <h4 className="font-heading font-semibold text-sm mb-4 text-accent tracking-wide">Portal Access</h4>
          <p className="text-sm text-primary-foreground/60 mb-5 leading-relaxed">
            Members can sign in to access branch services, manage applications, and the member directory.
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
        <div className="flex items-center gap-4">
          <Link to="/privacy-policy" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:text-primary-foreground transition-colors">Terms of Service</Link>
        </div>
        <p>
          Built by{" "}
          <a
            href="https://beamxsolutions.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-foreground/60 hover:text-primary-foreground transition-colors underline underline-offset-2"
          >
            BeamX Solutions
          </a>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
