import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { anaochaSidebarItems } from "@/lib/sidebarItems";

const AboutBranch = () => (
  <DashboardLayout title="NBA Anaocha" sidebarItems={anaochaSidebarItems}>
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">About NBA Anaocha Branch</h1>
      </div>
      <Card className="shadow-card">
        <CardContent className="p-6 space-y-4">
          <p className="text-foreground leading-relaxed">
            The Nigerian Bar Association (NBA), Anaocha Branch, is a branch of the Nigerian Bar Association dedicated to serving lawyers and legal practitioners within the Anaocha Local Government Area of Anambra State, Nigeria.
          </p>
          <p className="text-foreground leading-relaxed">
            Our mission is to manage members, enforce professional standards, and enable structured legal payments in compliance with the Remuneration Order 2023.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-lg bg-secondary">
              <h4 className="font-heading font-semibold text-secondary-foreground mb-1">Website</h4>
              <p className="text-sm text-muted-foreground">nbaanaocha.org.ng</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary">
              <h4 className="font-heading font-semibold text-secondary-foreground mb-1">Remuneration Portal</h4>
              <p className="text-sm text-muted-foreground">nbabranchremuneration.org.ng</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

export default AboutBranch;
