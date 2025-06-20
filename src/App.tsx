
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataModeProvider } from './contexts/DataModeContext';
import { SupabaseBookingProvider } from './contexts/SupabaseBookingContext';
import { ServiceProvider } from './contexts/ServiceContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import LandingPage from '@/pages/LandingPage';
import Auth from '@/pages/Auth';
import Services from '@/pages/Services';
import ServiceDetails from '@/pages/ServiceDetails';
import SubscriptionPackages from '@/pages/SubscriptionPackages';
import ClientDashboard from '@/pages/ClientDashboard';
import ProviderDashboard from '@/pages/ProviderDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import OneOffBooking from '@/pages/OneOffBooking';
import BookingConfirmation from '@/pages/BookingConfirmation';
import ProviderVerification from '@/pages/ProviderVerification';
import Search from '@/pages/Search';
import Contact from '@/pages/Contact';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import PaymentInstructions from '@/pages/PaymentInstructions';

function App() {
  return (
    <ErrorBoundary>
      <DataModeProvider>
        <AuthProvider>
          <ServiceProvider>
            <SupabaseBookingProvider>
              <Router>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/services/:id" element={<ServiceDetails />} />
                  <Route path="/subscription-packages" element={<SubscriptionPackages />} />
                  <Route path="/payment-instructions" element={<PaymentInstructions />} />
                  
                  {/* Protected routes with role-based access */}
                  <Route path="/client-dashboard" element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <ClientDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/provider-dashboard" element={
                    <ProtectedRoute allowedRoles={['provider']}>
                      <ProviderDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin-dashboard" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/one-off-booking" element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <OneOffBooking />
                    </ProtectedRoute>
                  } />
                  <Route path="/booking-confirmation" element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <BookingConfirmation />
                    </ProtectedRoute>
                  } />
                  <Route path="/provider-verification" element={
                    <ProtectedRoute allowedRoles={['provider']}>
                      <ProviderVerification />
                    </ProtectedRoute>
                  } />
                  <Route path="/search" element={
                    <ProtectedRoute>
                      <Search />
                    </ProtectedRoute>
                  } />
                  <Route path="/contact" element={
                    <ProtectedRoute>
                      <Contact />
                    </ProtectedRoute>
                  } />
                </Routes>
              </Router>
            </SupabaseBookingProvider>
          </ServiceProvider>
        </AuthProvider>
      </DataModeProvider>
    </ErrorBoundary>
  );
}

export default App;
