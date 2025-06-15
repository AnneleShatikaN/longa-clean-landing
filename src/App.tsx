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
import SearchPage from "./pages/Search";

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
              <ServiceProvider>
                <BookingProvider>
                  <SupabaseBookingProvider>
                    <PayoutProvider>
                      <DataProvider>
                        <NotificationProvider>
                          <TooltipProvider>
                            <SessionManager />
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/auth" element={<Auth />} />
                              <Route path="/auth/callback" element={<Auth />} />
                              <Route path="/admin-setup" element={<AdminSetup />} />
                              <Route path="/search" element={<SearchPage />} />
                              
                              {/* Dashboard routes */}
                              <Route 
                                path="/dashboard/admin" 
                                element={
                                  <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminDashboard />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route 
                                path="/dashboard/client" 
                                element={
                                  <ProtectedRoute allowedRoles={['client']}>
                                    <ClientDashboard />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route 
                                path="/dashboard/provider" 
                                element={
                                  <ProtectedRoute allowedRoles={['provider']}>
                                    <ProviderDashboard />
                                  </ProtectedRoute>
                                } 
                              />
                              
                              {/* Other protected routes */}
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
                              
                              {/* Legacy routes for backward compatibility */}
                              <Route path="/client-dashboard" element={<ProtectedRoute allowedRoles={['client']}><ClientDashboard /></ProtectedRoute>} />
                              <Route path="/provider-dashboard" element={<ProtectedRoute allowedRoles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
                              <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                              
                              {/* Catch all route */}
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                            <Toaster />
                            <Sonner />
                          </TooltipProvider>
                        </NotificationProvider>
                      </DataProvider>
                    </PayoutProvider>
                  </SupabaseBookingProvider>
                </BookingProvider>
              </ServiceProvider>
            </UserProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
