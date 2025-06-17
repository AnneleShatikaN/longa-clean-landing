

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserProvider } from '@/contexts/UserContext';
import { DataModeProvider } from '@/contexts/DataModeContext';
import { ServiceProvider } from '@/contexts/ServiceContext';
import { PayoutProvider } from '@/contexts/PayoutContext';
import { SupabaseBookingProvider } from '@/contexts/SupabaseBookingContext';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Search from '@/pages/Search';
import SubscriptionPackages from '@/pages/SubscriptionPackages';
import OneOffBooking from '@/pages/OneOffBooking';
import NotificationCenter from '@/pages/NotificationCenter';
import ClientDashboard from '@/pages/ClientDashboard';
import ProviderDashboard from '@/pages/ProviderDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminSetup from '@/pages/AdminSetup';
import NotFound from '@/pages/NotFound';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import NotificationSystem from '@/components/NotificationSystem';

import ProviderProfile from '@/pages/ProviderProfile';

function App() {
  return (
    <Router>
      <QueryClientProvider client={new QueryClient()}>
        <AuthProvider>
          <UserProvider>
            <DataModeProvider>
              <ServiceProvider>
                <PayoutProvider>
                  <SupabaseBookingProvider>
                    <div className="min-h-screen bg-gray-50">
                      <Toaster />
                      <NotificationSystem />
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/subscription-packages" element={<SubscriptionPackages />} />
                        <Route path="/one-off-booking" element={<OneOffBooking />} />
                        <Route path="/notification-center" element={<NotificationCenter />} />
                        <Route path="/provider/:providerId" element={<ProviderProfile />} />
                        
                        {/* Protected Routes */}
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
                          path="/admin-setup"
                          element={
                            <ProtectedRoute allowedRoles={['admin']}>
                              <AdminSetup />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                  </SupabaseBookingProvider>
                </PayoutProvider>
              </ServiceProvider>
            </DataModeProvider>
          </UserProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
