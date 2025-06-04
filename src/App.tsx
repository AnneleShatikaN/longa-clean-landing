import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";
import { ServiceProvider } from "@/contexts/ServiceContext";
import { BookingProvider } from "@/contexts/BookingContext";
import { SupabaseBookingProvider } from "@/contexts/SupabaseBookingContext";
import { PayoutProvider } from "@/contexts/PayoutContext";
import { DataProvider } from "@/contexts/DataContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SessionManager } from "@/components/SessionManager";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ClientDashboard from "./pages/ClientDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSetup from "./pages/AdminSetup";
import OneOffBooking from "./pages/OneOffBooking";
import SubscriptionPackages from "./pages/SubscriptionPackages";
import NotificationCenter from "./pages/NotificationCenter";
import NotFound from "./pages/NotFound";
import SearchPage from "./pages/SearchPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <UserProvider>
              <NotificationProvider>
                <ServiceProvider>
                  <BookingProvider>
                    <SupabaseBookingProvider>
                      <PayoutProvider>
                        <DataProvider>
                          <TooltipProvider>
                            <SessionManager />
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/auth" element={<Auth />} />
                              <Route path="/admin-setup" element={<AdminSetup />} />
                              <Route path="/search" element={<SearchPage />} />
                              <Route 
                                path="/client-dashboard" 
                                element={
                                  <ProtectedRoute allowedRoles={['client']}>
                                    <ClientDashboard />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route 
                                path="/provider-dashboard" 
                                element={
                                  <ProtectedRoute allowedRoles={['provider']}>
                                    <ProviderDashboard />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route 
                                path="/admin-dashboard" 
                                element={
                                  <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminDashboard />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route 
                                path="/notifications" 
                                element={
                                  <ProtectedRoute allowedRoles={['client', 'provider', 'admin']}>
                                    <NotificationCenter />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route 
                                path="/book-service" 
                                element={
                                  <ProtectedRoute allowedRoles={['client']}>
                                    <OneOffBooking />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route 
                                path="/subscriptions" 
                                element={
                                  <ProtectedRoute allowedRoles={['client']}>
                                    <SubscriptionPackages />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                            <Toaster />
                            <Sonner />
                          </TooltipProvider>
                        </DataProvider>
                      </PayoutProvider>
                    </SupabaseBookingProvider>
                  </BookingProvider>
                </ServiceProvider>
              </NotificationProvider>
            </UserProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
