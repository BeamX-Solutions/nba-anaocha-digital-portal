import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="container py-10 md:py-12">
      <div className="text-center mb-8">
        <p className="font-heading text-base font-bold text-primary-foreground tracking-wide">NBA Anaocha Branch</p>
      </div>

      <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-8">
        {[
          { label: "Legal Aid", to: "/anaocha/apply" },
          { label: "Member Directory", to: "/anaocha/find-member" },
          { label: "Privacy Policy", to: "/" },
          { label: "Contact Support", to: "/anaocha/contact" },
        ].map((l) => (
          <Link
            key={l.label}
            to={l.to}
            className="text-[10px] font-bold tracking-widest uppercase text-primary-foreground/60 hover:text-primary-foreground transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-primary-foreground/20 pt-6 text-center">
        <p className="text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} NBA Anaocha Branch. All Rights Reserved. Promoting the Rule of Law since 2014.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
