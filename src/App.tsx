import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import SplashScreen from "@/components/SplashScreen";
import ErrorBoundary from "@/components/ErrorBoundary";

// Eager: landing, auth, shell
import Index from "./pages/Index.tsx";
import DashboardRedirect from "./pages/DashboardRedirect.tsx";
import NotFound from "./pages/NotFound.tsx";
import SignIn from "./pages/auth/SignIn.tsx";
import SignUp from "./pages/auth/SignUp.tsx";
import ForgotPassword from "./pages/auth/ForgotPassword.tsx";
import ResetPassword from "./pages/auth/ResetPassword.tsx";
import CompleteProfile from "./pages/auth/CompleteProfile.tsx";

// Lazy: anaocha portal
const AnaochaDashboard    = lazy(() => import("./pages/anaocha/AnaochaDashboard.tsx"));
const ApplyForServices    = lazy(() => import("./pages/anaocha/ApplyForServices.tsx"));
const MyApplications      = lazy(() => import("./pages/anaocha/MyApplications.tsx"));
const FindMember          = lazy(() => import("./pages/anaocha/FindMember.tsx"));
const MyProfile           = lazy(() => import("./pages/anaocha/MyProfile.tsx"));
const Settings            = lazy(() => import("./pages/anaocha/Settings.tsx"));
const ContactUs           = lazy(() => import("./pages/anaocha/ContactUs.tsx"));
const Notifications       = lazy(() => import("./pages/anaocha/Notifications.tsx"));
const AnaochaPayments     = lazy(() => import("./pages/anaocha/AnaochaPayments.tsx"));
const MyDues              = lazy(() => import("./pages/anaocha/MyDues.tsx"));
const AboutBranch         = lazy(() => import("./pages/anaocha/AboutBranch.tsx"));
const Blog                = lazy(() => import("./pages/Blog.tsx"));
const Resources           = lazy(() => import("./pages/Resources.tsx"));
const PrivacyPolicy       = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const TermsOfService      = lazy(() => import("./pages/TermsOfService.tsx"));

// Lazy: admin
const AdminDashboard    = lazy(() => import("./pages/admin/AdminDashboard.tsx"));
const AdminApplications = lazy(() => import("./pages/admin/AdminApplications.tsx"));
const AdminMembers      = lazy(() => import("./pages/admin/AdminMembers.tsx"));
const AdminNotify       = lazy(() => import("./pages/admin/AdminNotify.tsx"));
const AdminContacts     = lazy(() => import("./pages/admin/AdminContacts.tsx"));
const AdminAnnouncements = lazy(() => import("./pages/admin/AdminAnnouncements.tsx"));
const AdminResources    = lazy(() => import("./pages/admin/AdminResources.tsx"));
const AdminLeadership   = lazy(() => import("./pages/admin/AdminLeadership.tsx"));
const AdminAuditLogs    = lazy(() => import("./pages/admin/AdminAuditLogs.tsx"));
const AdminDues         = lazy(() => import("./pages/admin/AdminDues.tsx"));
const AdminRoles        = lazy(() => import("./pages/admin/AdminRoles.tsx"));
const AdminReporting    = lazy(() => import("./pages/admin/AdminReporting.tsx"));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
    mutations: {
      onError: (error) => {
        console.error('[QueryClient mutation error]', error);
      },
    },
  },
});

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <SplashScreen>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />

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
              <Route path="/anaocha/dues"     element={<ProtectedRoute><MyDues /></ProtectedRoute>} />
              <Route path="/anaocha/payments" element={<ProtectedRoute><AnaochaPayments /></ProtectedRoute>} />
              <Route path="/anaocha/members" element={<ProtectedRoute><FindMember /></ProtectedRoute>} />
              <Route path="/anaocha/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/anaocha/contact" element={<ContactUs />} />
              <Route path="/anaocha/about" element={<ProtectedRoute><AboutBranch /></ProtectedRoute>} />
              <Route path="/blog" element={<Blog />} />

              {/* Admin Module */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/applications" element={<AdminRoute><AdminApplications /></AdminRoute>} />
              <Route path="/admin/members" element={<AdminRoute><AdminMembers /></AdminRoute>} />
              <Route path="/admin/contacts" element={<AdminRoute><AdminContacts /></AdminRoute>} />
              <Route path="/admin/notify" element={<AdminRoute><AdminNotify /></AdminRoute>} />
              <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />
              <Route path="/admin/resources" element={<AdminRoute><AdminResources /></AdminRoute>} />
              <Route path="/admin/leadership" element={<AdminRoute><AdminLeadership /></AdminRoute>} />
              <Route path="/admin/dues"       element={<AdminRoute><AdminDues /></AdminRoute>} />
              <Route path="/admin/audit-logs" element={<AdminRoute><AdminAuditLogs /></AdminRoute>} />
              <Route path="/admin/roles" element={<AdminRoute><AdminRoles /></AdminRoute>} />
              <Route path="/admin/reporting" element={<AdminRoute><AdminReporting /></AdminRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </SplashScreen>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
