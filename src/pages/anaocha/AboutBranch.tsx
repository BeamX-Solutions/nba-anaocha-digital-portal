import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { anaochaSidebarItems } from "@/lib/sidebarItems";
import aboutBranch from "@/assets/about-branch.png";

const AboutBranch = () => (
  <DashboardLayout title="NBA Anaocha" sidebarItems={anaochaSidebarItems}>
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">About NBA Anaocha Branch</h1>
        <p className="text-muted-foreground mt-1">The Family Bar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4 text-muted-foreground leading-relaxed text-sm md:text-base">
          <p>
            The Nigerian Bar Association Anaocha Branch, popularly known as the "Family Bar," is one of the
            youngest yet most dynamic branches of the Nigerian Bar Association, officially inaugurated in May
            2014. Since its establishment, the branch has grown into a vibrant community of legal practitioners
            committed to promoting the rule of law, upholding professional ethics, and advancing justice within
            Anaocha and beyond. As part of the broader NBA network, the branch provides a platform for
            collaboration, knowledge sharing, and the continuous development of its members.
          </p>
          <p>
            Driven by a culture of inclusiveness and excellence, the NBA Anaocha Branch actively engages in
            legal advocacy, capacity-building programmes, and community-focused initiatives. The branch
            regularly organizes trainings, sensitisation programmes, and professional development activities to
            keep members aligned with evolving legal standards and practice. With a strong emphasis on member
            welfare, unity, and service, the branch continues to position itself as a progressive force
            dedicated to strengthening the legal profession and contributing meaningfully to society.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Card className="shadow-card">
              <CardContent className="p-4">
                <h4 className="font-heading font-semibold text-foreground mb-1">Website</h4>
                <p className="text-sm text-muted-foreground">nbaanaocha.org.ng</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <h4 className="font-heading font-semibold text-foreground mb-1">Remuneration Portal</h4>
                <p className="text-sm text-muted-foreground">nbabranchremuneration.org.ng</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <img
          src={aboutBranch}
          alt="NBA Anaocha Branch"
          className="w-full rounded-xl shadow-lg"
        />
      </div>
    </div>
  </DashboardLayout>
);

export default AboutBranch;
