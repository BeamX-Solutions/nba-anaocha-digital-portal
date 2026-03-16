import { Link } from "react-router-dom";
import nbaLogo from "@/assets/nba-logo.png";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <img src={nbaLogo} alt="NBA Anaocha" className="h-10 w-10" />
            <span className="font-heading text-lg font-bold">NBA Anaocha</span>
          </div>
          <p className="text-sm text-primary-foreground/70">
            Managing Members. Enforcing Standards. Enabling Structured Legal Payments.
          </p>
        </div>

        <div>
          <h4 className="font-heading font-semibold mb-3 text-accent">Quick Links</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><Link to="/" className="hover:text-primary-foreground">Home</Link></li>
            <li><Link to="/anaocha/about" className="hover:text-primary-foreground">About Branch</Link></li>
            <li><Link to="/anaocha/committees" className="hover:text-primary-foreground">Committees</Link></li>
            <li><Link to="/anaocha/contact" className="hover:text-primary-foreground">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold mb-3 text-accent">Remuneration</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><Link to="/remuneration/prepare" className="hover:text-primary-foreground">Prepare a Document</Link></li>
            <li><Link to="/remuneration/documents" className="hover:text-primary-foreground">My Documents</Link></li>
            <li><Link to="/remuneration/payments" className="hover:text-primary-foreground">Payment History</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold mb-3 text-accent">Contact</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li>nbaanaocha.org.ng</li>
            <li>nbabranchremuneration.org.ng</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm text-primary-foreground/50">
        © {new Date().getFullYear()} Nigerian Bar Association — Anaocha Branch. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
