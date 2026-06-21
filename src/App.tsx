import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import RequireAuth from "@/components/RequireAuth";
import Index from "./pages/Index.tsx";
import { PaymentTestModeBanner } from "./components/PaymentTestModeBanner";
import ConsentBanner from "./components/ConsentBanner";

const Auth = lazy(() => import("./pages/Auth.tsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.tsx"));
const Dashboard = lazy(() => import("./pages/app/Dashboard.tsx"));
const Journal = lazy(() => import("./pages/app/Journal.tsx"));
const Insights = lazy(() => import("./pages/app/Insights.tsx"));
const Settings = lazy(() => import("./pages/app/Settings.tsx"));
const MindMap = lazy(() => import("./pages/app/MindMap.tsx"));
const Inbox = lazy(() => import("./pages/app/Inbox.tsx"));
const TherapistBridge = lazy(() => import("./pages/app/TherapistBridge.tsx"));
const MentorProfile = lazy(() => import("./pages/app/MentorProfile.tsx"));
const IntegrationsCallback = lazy(() => import("./pages/app/IntegrationsCallback.tsx"));

const DynamicSeoPage = lazy(() => import("./pages/seo/DynamicSeoPage.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Founder = lazy(() => import("./pages/Founder.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const TermsOfService = lazy(() => import("./pages/TermsOfService.tsx"));
const CheckoutReturn = lazy(() => import("./pages/CheckoutReturn.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Blog = lazy(() => import("./pages/Blog.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));
const Pricing = lazy(() => import("./pages/Pricing.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe.tsx"));
const AdminAnalytics = lazy(() => import("./pages/app/AdminAnalytics.tsx"));
const AdminUsers = lazy(() => import("./pages/app/AdminUsers.tsx"));
const AdminSeo = lazy(() => import("./pages/app/AdminSeo.tsx"));
const Compare = lazy(() => import("./pages/Compare.tsx"));
const MobileWelcome = lazy(() => import("./pages/MobileWelcome.tsx"));
const Upgrade = lazy(() => import("./pages/Upgrade.tsx"));


const queryClient = new QueryClient();
const OAUTH_REDIRECT_KEY = "nexomind:oauth_redirect";

const OAuthRedirectHandler = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || !user) return;
    if (localStorage.getItem(OAUTH_REDIRECT_KEY) !== "app") return;
    localStorage.removeItem(OAUTH_REDIRECT_KEY);
    if (location.pathname !== "/app") navigate("/app", { replace: true });
  }, [loading, user, location.pathname, navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <OAuthRedirectHandler />
          <PaymentTestModeBanner />
          <ConsentBanner />
          <Suspense
            fallback={
              <div className="min-h-screen" style={{ backgroundColor: "#F3F4ED" }} />
            }
          >
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/upgrade" element={<Upgrade />} />

              <Route
                path="/onboarding"
                element={
                  <RequireAuth>
                    <Onboarding />
                  </RequireAuth>
                }
              />
              <Route
                path="/app"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/app/journal"
                element={
                  <RequireAuth>
                    <Journal />
                  </RequireAuth>
                }
              />
              <Route
                path="/app/insights"
                element={
                  <RequireAuth>
                    <Insights />
                  </RequireAuth>
                }
              />
              <Route
                path="/app/settings"
                element={
                  <RequireAuth>
                    <Settings />
                  </RequireAuth>
                }
              />
              <Route
                path="/app/settings/integrations/callback"
                element={
                  <RequireAuth>
                    <IntegrationsCallback />
                  </RequireAuth>
                }
              />
              <Route
                path="/app/mind-map"
                element={
                  <RequireAuth>
                    <MindMap />
                  </RequireAuth>
                }
              />
              <Route
                path="/app/inbox"
                element={
                  <RequireAuth>
                    <Inbox />
                  </RequireAuth>
                }
              />
              <Route
                path="/app/therapist-bridge"
                element={
                  <RequireAuth>
                    <TherapistBridge />
                  </RequireAuth>
                }
              />
              <Route
                path="/app/mentor-profile"
                element={
                  <RequireAuth>
                    <MentorProfile />
                  </RequireAuth>
                }
              />

              <Route
                path="/app/admin/analytics"
                element={
                  <RequireAuth>
                    <AdminAnalytics />
                  </RequireAuth>
                }
              />
              <Route
                path="/app/admin/users"
                element={
                  <RequireAuth>
                    <AdminUsers />
                  </RequireAuth>
                }
              />
              <Route
                path="/app/admin/seo"
                element={
                  <RequireAuth>
                    <AdminSeo />
                  </RequireAuth>
                }
              />
              <Route path="/about" element={<About />} />
              <Route path="/founder" element={<Founder />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/terms" element={<Navigate to="/terms-of-service" replace />} />
              <Route path="/checkout/return" element={<CheckoutReturn />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/welcome" element={<MobileWelcome />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/:slug" element={<DynamicSeoPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
