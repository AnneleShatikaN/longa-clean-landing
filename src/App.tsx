import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ServiceProvider } from "@/contexts/ServiceContext";
import { SupabaseBookingProvider } from "@/contexts/SupabaseBookingContext";
import Auth from "@/pages/Auth";
import Contact from "@/pages/Contact";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import SubscriptionPackages from "@/pages/SubscriptionPackages";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Search from "@/pages/Search";
import ClientDashboard from "@/pages/ClientDashboard";
import ProviderDashboard from "@/pages/ProviderDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import ServiceDetails from "@/pages/ServiceDetails";
import Bookings from "@/pages/Bookings";
import OneOffBooking from "@/pages/OneOffBooking";
import { SessionManager } from "@/components/SessionManager";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { AuthCallback } from "@/components/auth/AuthCallback";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ServiceProvider>
          <SupabaseBookingProvider>
            <TooltipProvider>
              <Toaster />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/subscription-packages" element={<SubscriptionPackages />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/client-dashboard" element={<ClientDashboard />} />
                  <Route path="/provider-dashboard" element={<ProviderDashboard />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/service/:serviceId" element={<ServiceDetails />} />
                  <Route path="/bookings" element={<Bookings />} />
                  <Route path="/one-off-booking" element={<OneOffBooking />} />
                  <Route path="/session" element={<SessionManager />} />
                  
                  {/* Enhanced Auth Routes */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/forgot-password" element={<PasswordResetForm />} />
                  <Route path="/auth/reset-password" element={<PasswordResetForm />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/auth/verify" element={<AuthCallback />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </SupabaseBookingProvider>
        </ServiceProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
