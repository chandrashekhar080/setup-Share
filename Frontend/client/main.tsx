import "./global.css";

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import User from "./pages/User";
import UserDashboard from "./pages/UserDashboard";
import UserProfile from "./pages/UserProfile";
import Events from "./pages/Events";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import OtpLogin from "./pages/OtpLogin";
import EmailOtpLogin from "./pages/EmailOtpLogin";
import TimeSharing from "./pages/TimeSharing";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Donation from "./pages/Donation";
import TermsConditions from "./pages/TermsConditions";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import { DashboardTest } from "./components/DashboardTest";

const queryClient = new QueryClient();

// Simple route guards
const RequireAdmin = ({ children }: { children: JSX.Element }) => {
  const isAdmin = localStorage.getItem("admin_token") && localStorage.getItem("admin_user");
  return isAdmin ? children : <Navigate to="/admin-login" replace />;
};

const RequireUser = ({ children }: { children: JSX.Element }) => {
  const isUser = localStorage.getItem("userToken");
  return isUser ? children : <Navigate to="/user" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/user" element={<User />} />
          <Route path="/dashboard" element={<RequireUser><UserDashboard /></RequireUser>} />
          <Route path="/user-dashboard" element={<RequireUser><UserDashboard /></RequireUser>} />
          <Route path="/admin/user/:userId" element={<RequireAdmin><UserProfile /></RequireAdmin>} />
          <Route path="/events" element={<Events />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
          <Route path="/otp-login" element={<OtpLogin />} />
          <Route path="/email-otp-login" element={<EmailOtpLogin />} />
          <Route path="/time-sharing" element={<TimeSharing />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/donation" element={<Donation />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/care-dashboard" element={<Dashboard />} />
          <Route path="/dashboard-test" element={<DashboardTest />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
