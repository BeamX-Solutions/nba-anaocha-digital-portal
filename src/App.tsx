import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

// Auth pages
import SignIn from "./pages/auth/SignIn.tsx";
import SignUp from "./pages/auth/SignUp.tsx";
import ForgotPassword from "./pages/auth/ForgotPassword.tsx";
import ResetPassword from "./pages/auth/ResetPassword.tsx";

// Anaocha pages
import AnaochaDashboard from "./pages/anaocha/AnaochaDashboard.tsx";
import ApplyForServices from "./pages/anaocha/ApplyForServices.tsx";
import Committees from "./pages/anaocha/Committees.tsx";
import FindMember from "./pages/anaocha/FindMember.tsx";
import MyProfile from "./pages/anaocha/MyProfile.tsx";
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
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Auth routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* NBA Anaocha Module - Protected */}
            <Route path="/anaocha/dashboard" element={<ProtectedRoute><AnaochaDashboard /></ProtectedRoute>} />
            <Route path="/anaocha/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
            <Route path="/anaocha/apply" element={<ProtectedRoute><ApplyForServices /></ProtectedRoute>} />
            <Route path="/anaocha/applications" element={<ProtectedRoute><AnaochaDashboard /></ProtectedRoute>} />
            <Route path="/anaocha/payments" element={<ProtectedRoute><AnaochaDashboard /></ProtectedRoute>} />
            <Route path="/anaocha/about" element={<AboutBranch />} />
            <Route path="/anaocha/committees" element={<Committees />} />
            <Route path="/anaocha/members" element={<ProtectedRoute><FindMember /></ProtectedRoute>} />
            <Route path="/anaocha/notifications" element={<ProtectedRoute><AnaochaDashboard /></ProtectedRoute>} />
            <Route path="/anaocha/contact" element={<ContactUs />} />

            {/* Remuneration Module - Protected */}
            <Route path="/remuneration/dashboard" element={<ProtectedRoute><RemunerationDashboard /></ProtectedRoute>} />
            <Route path="/remuneration/prepare" element={<ProtectedRoute><PrepareDocument /></ProtectedRoute>} />
            <Route path="/remuneration/documents" element={<ProtectedRoute><MyDocuments /></ProtectedRoute>} />
            <Route path="/remuneration/payments" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
            <Route path="/remuneration/search" element={<ProtectedRoute><FindDocument /></ProtectedRoute>} />
            <Route path="/remuneration/apply" element={<ProtectedRoute><RemunerationDashboard /></ProtectedRoute>} />
            <Route path="/remuneration/notifications" element={<ProtectedRoute><RemunerationDashboard /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
