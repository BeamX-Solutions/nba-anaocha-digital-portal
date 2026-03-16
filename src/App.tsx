import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

// Anaocha pages
import AnaochaDashboard from "./pages/anaocha/AnaochaDashboard.tsx";
import ApplyForServices from "./pages/anaocha/ApplyForServices.tsx";
import Committees from "./pages/anaocha/Committees.tsx";
import FindMember from "./pages/anaocha/FindMember.tsx";
import AboutBranch from "./pages/anaocha/AboutBranch.tsx";
import ContactUs from "./pages/anaocha/ContactUs.tsx";

// Remuneration pages
import RemunerationDashboard from "./pages/remuneration/RemunerationDashboard.tsx";
import PrepareDocument from "./pages/remuneration/PrepareDocument.tsx";
import MyDocuments from "./pages/remuneration/MyDocuments.tsx";
import PaymentHistory from "./pages/remuneration/PaymentHistory.tsx";
import FindDocument from "./pages/remuneration/FindDocument.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* NBA Anaocha Module */}
          <Route path="/anaocha/dashboard" element={<AnaochaDashboard />} />
          <Route path="/anaocha/apply" element={<ApplyForServices />} />
          <Route path="/anaocha/applications" element={<AnaochaDashboard />} />
          <Route path="/anaocha/payments" element={<AnaochaDashboard />} />
          <Route path="/anaocha/about" element={<AboutBranch />} />
          <Route path="/anaocha/committees" element={<Committees />} />
          <Route path="/anaocha/members" element={<FindMember />} />
          <Route path="/anaocha/notifications" element={<AnaochaDashboard />} />
          <Route path="/anaocha/contact" element={<ContactUs />} />

          {/* Remuneration Module */}
          <Route path="/remuneration/dashboard" element={<RemunerationDashboard />} />
          <Route path="/remuneration/prepare" element={<PrepareDocument />} />
          <Route path="/remuneration/documents" element={<MyDocuments />} />
          <Route path="/remuneration/payments" element={<PaymentHistory />} />
          <Route path="/remuneration/search" element={<FindDocument />} />
          <Route path="/remuneration/apply" element={<RemunerationDashboard />} />
          <Route path="/remuneration/notifications" element={<RemunerationDashboard />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
