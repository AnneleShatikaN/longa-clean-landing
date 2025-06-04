
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SupabaseBookingProvider } from "@/contexts/SupabaseBookingContext";
import { BookingProvider } from "@/contexts/BookingContext";
import { ServiceProvider } from "@/contexts/ServiceContext";
import { UserProvider } from "@/contexts/UserContext";
import { PayoutProvider } from "@/contexts/PayoutContext";
import { DataProvider } from "@/contexts/DataContext";
import { SessionManager } from "@/components/SessionManager";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminSetup from "./pages/AdminSetup";
import ClientDashboard from "./pages/ClientDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OneOffBooking from "./pages/OneOffBooking";
import SubscriptionPackages from "./pages/SubscriptionPackages";
import NotFound from "./pages/NotFound";

// Create QueryClient instance outside of component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <DataProvider>
              <UserProvider>
                <ServiceProvider>
                  <PayoutProvider>
                    <BookingProvider>
                      <SupabaseBookingProvider>
                        <SessionManager />
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/auth" element={<Auth />} />
                          <Route path="/admin/setup" element={<AdminSetup />} />
                          <Route path="/dashboard/client" element={<ClientDashboard />} />
                          <Route path="/dashboard/provider" element={<ProviderDashboard />} />
                          <Route path="/dashboard/admin" element={<AdminDashboard />} />
                          <Route path="/book/one-off" element={<OneOffBooking />} />
                          <Route path="/book/subscription" element={<SubscriptionPackages />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </SupabaseBookingProvider>
                    </BookingProvider>
                  </PayoutProvider>
                </ServiceProvider>
              </UserProvider>
            </DataProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
