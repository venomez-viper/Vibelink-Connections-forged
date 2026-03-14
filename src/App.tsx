import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// App (authenticated portal)
import GlobalChat from "@/components/app/GlobalChat";

// Website (public marketing)
import Index from "./pages/website/Index";
import HowItWorks from "./pages/website/HowItWorks";
import Safety from "./pages/website/Safety";
import About from "./pages/website/About";
import Blog from "./pages/website/Blog";
import BlogPost from "./pages/website/BlogPost";
import Terms from "./pages/website/Terms";
import Privacy from "./pages/website/Privacy";
import CommunityGuidelines from "./pages/website/CommunityGuidelines";
import Contact from "./pages/website/Contact";
import NotFound from "./pages/website/NotFound";

// Auth
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// App (authenticated portal)
import Dashboard from "./pages/app/Dashboard";
import Discover from "./pages/app/Discover";
import Requests from "./pages/app/Requests";
import Connections from "./pages/app/Connections";
import Analytics from "./pages/app/Analytics";
import Messages from "./pages/app/Messages";
import ProfileShowcase from "./pages/app/ProfileShowcase";
import NearbyMatches from "./pages/app/NearbyMatches";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Website */}
          <Route path="/" element={<Index />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/community-guidelines" element={<CommunityGuidelines />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* App */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile/:userId" element={<ProfileShowcase />} />
          <Route path="/nearby-matches" element={<NearbyMatches />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <GlobalChat />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
