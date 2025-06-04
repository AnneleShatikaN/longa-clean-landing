
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { UserProvider } from "@/contexts/UserContext";
import { ServiceProvider } from "@/contexts/ServiceContext";
import { BookingProvider } from "@/contexts/BookingContext";
import { SupabaseBookingProvider } from "@/contexts/SupabaseBookingContext";
import { PayoutProvider } from "@/contexts/PayoutContext";
import { DataProvider } from "@/contexts/DataContext";
import { SessionManager } from "@/components/SessionManager";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <UserProvider>
              <ServiceProvider>
                <BookingProvider>
                  <SupabaseBookingProvider>
                    <PayoutProvider>
                      <DataProvider>
                        <SessionManager />
                        <ErrorBoundary>
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/auth" element={<Auth />} />
                            <Route path="/admin-setup" element={<AdminSetup />} />
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
                        </ErrorBoundary>
                      </DataProvider>
                    </PayoutProvider>
                  </SupabaseBookingProvider>
                </BookingProvider>
              </ServiceProvider>
            </UserProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
