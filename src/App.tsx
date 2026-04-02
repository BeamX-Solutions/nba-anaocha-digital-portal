import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Resources from "./pages/Resources.tsx";

// Auth pages
import SignIn from "./pages/auth/SignIn.tsx";
import SignUp from "./pages/auth/SignUp.tsx";
import ForgotPassword from "./pages/auth/ForgotPassword.tsx";
import ResetPassword from "./pages/auth/ResetPassword.tsx";
import CompleteProfile from "./pages/auth/CompleteProfile.tsx";

// Anaocha pages
import AnaochaDashboard from "./pages/anaocha/AnaochaDashboard.tsx";
import ApplyForServices from "./pages/anaocha/ApplyForServices.tsx";
import MyApplications from "./pages/anaocha/MyApplications.tsx";
import FindMember from "./pages/anaocha/FindMember.tsx";
import MyProfile from "./pages/anaocha/MyProfile.tsx";
import Settings from "./pages/anaocha/Settings.tsx";
import AboutBranch from "./pages/anaocha/AboutBranch.tsx";
import ContactUs from "./pages/anaocha/ContactUs.tsx";
import Notifications from "./pages/anaocha/Notifications.tsx";
import AnaochaPayments from "./pages/anaocha/AnaochaPayments.tsx";

// Remuneration pages
import RemunerationDashboard from "./pages/remuneration/RemunerationDashboard.tsx";
import PrepareDocument from "./pages/remuneration/PrepareDocument.tsx";
import MyDocuments from "./pages/remuneration/MyDocuments.tsx";
import PaymentHistory from "./pages/remuneration/PaymentHistory.tsx";
import FindDocument from "./pages/remuneration/FindDocument.tsx";
import RemunerationAbout from "./pages/remuneration/RemunerationAbout.tsx";
import RemunerationNotifications from "./pages/remuneration/RemunerationNotifications.tsx";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminApplications from "./pages/admin/AdminApplications.tsx";
import AdminMembers from "./pages/admin/AdminMembers.tsx";
import AdminDocuments from "./pages/admin/AdminDocuments.tsx";
import AdminNotify from "./pages/admin/AdminNotify.tsx";
import AdminContacts from "./pages/admin/AdminContacts.tsx";

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
            <Route path="/resources" element={<Resources />} />

            {/* Auth routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />

            {/* NBA Anaocha Module - Protected */}
            <Route path="/anaocha/dashboard" element={<ProtectedRoute><AnaochaDashboard /></ProtectedRoute>} />
            <Route path="/anaocha/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
            <Route path="/anaocha/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/anaocha/apply" element={<ProtectedRoute><ApplyForServices /></ProtectedRoute>} />
            <Route path="/anaocha/applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
            <Route path="/anaocha/payments" element={<ProtectedRoute><AnaochaPayments /></ProtectedRoute>} />
            <Route path="/anaocha/about" element={<AboutBranch />} />
            <Route path="/anaocha/members" element={<ProtectedRoute><FindMember /></ProtectedRoute>} />
            <Route path="/anaocha/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/anaocha/contact" element={<ContactUs />} />

            {/* Remuneration Module - Protected */}
            <Route path="/remuneration/dashboard" element={<ProtectedRoute><RemunerationDashboard /></ProtectedRoute>} />
            <Route path="/remuneration/prepare" element={<ProtectedRoute><PrepareDocument /></ProtectedRoute>} />
            <Route path="/remuneration/documents" element={<ProtectedRoute><MyDocuments /></ProtectedRoute>} />
            <Route path="/remuneration/payments" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
            <Route path="/remuneration/search" element={<ProtectedRoute><FindDocument /></ProtectedRoute>} />
            <Route path="/remuneration/about" element={<RemunerationAbout />} />
            <Route path="/remuneration/notifications" element={<ProtectedRoute><RemunerationNotifications /></ProtectedRoute>} />

            {/* Admin Module */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/applications" element={<AdminRoute><AdminApplications /></AdminRoute>} />
            <Route path="/admin/members" element={<AdminRoute><AdminMembers /></AdminRoute>} />
            <Route path="/admin/documents" element={<AdminRoute><AdminDocuments /></AdminRoute>} />
            <Route path="/admin/contacts" element={<AdminRoute><AdminContacts /></AdminRoute>} />
            <Route path="/admin/notify" element={<AdminRoute><AdminNotify /></AdminRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
