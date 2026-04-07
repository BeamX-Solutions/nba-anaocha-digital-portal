import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import nbaLogo from "@/assets/nba-logo.png";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <img src={nbaLogo} alt="NBA Anaocha" className="h-10 w-10" />
            <span className="font-heading text-lg font-bold">NBA Anaocha Branch</span>
          </div>
          <p className="text-sm text-primary-foreground/70">
            We are the Nigerian Bar Association, Anaocha Branch, promoting the rule of law, upholding professional ethics, and advancing justice within Anaocha and beyond.
          </p>
        </div>

        <div>
          <h4 className="font-heading font-semibold mb-3 text-accent">Links</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><Link to="/" className="hover:text-primary-foreground">Home</Link></li>
            <li><Link to="/" className="hover:text-primary-foreground">About Branch</Link></li>
            <li><Link to="/remuneration/about" className="hover:text-primary-foreground">Remuneration Portal</Link></li>
            <li><Link to="/anaocha/find-member" className="hover:text-primary-foreground">Find a Member</Link></li>
            <li><Link to="/anaocha/apply" className="hover:text-primary-foreground">Apply for Services</Link></li>
            <li><Link to="/anaocha/contact" className="hover:text-primary-foreground">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold mb-3 text-accent">Contact Us</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/70">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-accent flex-shrink-0" />
              <span>+234 000 000 000</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-accent flex-shrink-0" />
              <span>support@nbaanaocha.org.ng</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <span>NBA Anaocha Headquarters, Anambra State, Nigeria</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm text-primary-foreground/50">
        © {new Date().getFullYear()} NBA Anaocha. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
