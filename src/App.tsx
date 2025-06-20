import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataModeProvider } from './contexts/DataModeContext';
import { SupabaseBookingProvider } from './contexts/SupabaseBookingContext';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import ServicesPage from '@/pages/ServicesPage';
import ServiceDetails from '@/pages/ServiceDetails';
import SubscriptionPackages from '@/pages/SubscriptionPackages';
import ClientDashboard from '@/pages/ClientDashboard';
import ProviderDashboard from '@/pages/ProviderDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import OneOffBooking from '@/pages/OneOffBooking';
import BookingConfirmation from '@/pages/BookingConfirmation';
import ProviderVerification from '@/pages/ProviderVerification';
import SearchPage from '@/pages/SearchPage';
import ContactPage from '@/pages/ContactPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import PaymentInstructions from '@/pages/PaymentInstructions';

function App() {
  return (
    <DataModeProvider>
      <AuthProvider>
        <SupabaseBookingProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:id" element={<ServiceDetails />} />
              <Route path="/subscription-packages" element={<SubscriptionPackages />} />
              <Route path="/payment-instructions" element={<PaymentInstructions />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/client-dashboard" element={<ClientDashboard />} />
                <Route path="/provider-dashboard" element={<ProviderDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/one-off-booking" element={<OneOffBooking />} />
                <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                <Route path="/provider-verification" element={<ProviderVerification />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Route>
            </Routes>
          </Router>
        </SupabaseBookingProvider>
      </AuthProvider>
    </DataModeProvider>
  );
}

export default App;
