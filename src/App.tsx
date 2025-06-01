
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { ServiceProvider } from "@/contexts/ServiceContext";
import { BookingProvider } from "@/contexts/BookingContext";
import { PayoutProvider } from "@/contexts/PayoutContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ClientDashboard from "./pages/ClientDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OneOffBooking from "./pages/OneOffBooking";
import SubscriptionPackages from "./pages/SubscriptionPackages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserProvider>
        <ServiceProvider>
          <BookingProvider>
            <PayoutProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard/client" element={<ClientDashboard />} />
                  <Route path="/dashboard/provider" element={<ProviderDashboard />} />
                  <Route path="/dashboard/admin" element={<AdminDashboard />} />
                  <Route path="/booking/one-off" element={<OneOffBooking />} />
                  <Route path="/subscription-packages" element={<SubscriptionPackages />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </PayoutProvider>
          </BookingProvider>
        </ServiceProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
