import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface LegalPageProps {
  /** Page heading shown in the title bar (e.g. "Terms of Service"). */
  title: string;
  /** Raw markdown content to render. */
  content: string;
}

const LegalPage = ({ title, content }: LegalPageProps) => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />

    <main className="flex-1">
      <div className="container max-w-4xl py-12 md:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-8">{title}</h1>

        <article className="prose prose-sm md:prose-base max-w-none prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-table:text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      </div>
    </main>

    <Footer />
  </div>
);

export default LegalPage;
