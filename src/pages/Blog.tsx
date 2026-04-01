import { Calendar, Tag } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { anaochaSidebarItems } from "@/lib/sidebarItems";

const posts = [
  {
    title: "NBA Anaocha Branch 2025 Annual General Conference",
    date: "2025-11-10",
    category: "Events",
    summary:
      "The NBA Anaocha Branch will hold its Annual General Conference on November 10, 2025. Members are encouraged to pay their branch dues and ensure their IDs are up to date before the conference.",
  },
  {
    title: "Remuneration Order 2023: What Every Property Lawyer Must Know",
    date: "2025-09-05",
    category: "Legal Updates",
    summary:
      "A detailed breakdown of the Legal Practitioners' Remuneration Order 2023 and its implications for property transactions, including the mandatory 10% fee on consideration amounts.",
  },
  {
    title: "New NBA Remuneration Portal Now Live",
    date: "2025-08-20",
    category: "Announcements",
    summary:
      "The NBA Anaocha Branch is pleased to announce the launch of the NBA Remuneration Portal at nbabranchremuneration.org.ng. Legal practitioners can now generate compliant documents and process payments online.",
  },
  {
    title: "Bar Identification Number (BAIN) — Application Process",
    date: "2025-07-15",
    category: "Guides",
    summary:
      "A step-by-step guide on how to apply for your Bar Identification Number (BAIN). Members are required to upload proof of the 10% fee payment through the portal.",
  },
  {
    title: "Welfare Committee Update: Legal Aid Clinic",
    date: "2025-06-01",
    category: "Welfare",
    summary:
      "The NBA Anaocha Welfare Committee announces a free legal aid clinic for indigent residents. Interested lawyers who wish to volunteer should contact the Welfare Committee Chair.",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Events: "bg-blue-100 text-blue-800",
  "Legal Updates": "bg-green-100 text-green-800",
  Announcements: "bg-accent/20 text-accent-foreground",
  Guides: "bg-purple-100 text-purple-800",
  Welfare: "bg-pink-100 text-pink-800",
};

const Blog = () => (
  <DashboardLayout title="NBA Anaocha" sidebarItems={anaochaSidebarItems}>
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold text-foreground">Blog & Updates</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          News, announcements, and legal updates from NBA Anaocha Branch.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.title} className="shadow-card hover:shadow-lg transition-shadow flex flex-col">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[post.category] || "bg-muted text-muted-foreground"}`}>
                  <Tag className="inline h-3 w-3 mr-1" />{post.category}
                </span>
              </div>
              <h3 className="font-heading text-base font-semibold text-card-foreground mb-2 leading-snug flex-1">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{post.summary}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Date(post.date).toLocaleDateString("en-NG", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default Blog;
