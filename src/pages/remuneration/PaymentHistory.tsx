import { CreditCard } from "lucide-react";
import RemunerationLayout from "@/components/RemunerationLayout";
import { Card, CardContent } from "@/components/ui/card";
import { remunerationSidebarItems } from "@/lib/sidebarItems";

const PaymentHistory = () => (
  <RemunerationLayout sidebarItems={remunerationSidebarItems}>
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Payment History</h1>
        <p className="text-muted-foreground mt-1">Track your remuneration payments and download receipts.</p>
      </div>
      <Card className="shadow-card">
        <CardContent className="p-8 text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No payments recorded yet.</p>
        </CardContent>
      </Card>
    </div>
  </RemunerationLayout>
);

export default PaymentHistory;
