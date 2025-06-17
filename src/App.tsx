
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/AuthContext';
import { UserProvider } from '@/contexts/UserContext';
import { DataModeProvider } from '@/contexts/DataModeContext';
import { DataProvider } from '@/contexts/DataContext';
import { ServiceProvider } from '@/contexts/ServiceContext';
import { PayoutProvider } from '@/contexts/PayoutContext';
import { SupabaseBookingProvider } from '@/contexts/SupabaseBookingContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import Auth from './pages/Auth';
import ClientDashboard from './pages/ClientDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import ServiceDetails from './pages/ServiceDetails';
import BookingPage from './pages/BookingPage';
import OneOffBooking from './pages/OneOffBooking';
import SubscriptionPackages from './pages/SubscriptionPackages';
import Search from './pages/Search';
import ProviderAvailability from './pages/ProviderAvailability';
import { LocationProvider } from '@/contexts/LocationContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AuthProvider>
            <UserProvider>
              <DataModeProvider>
                <DataProvider>
                  <ServiceProvider>
                    <LocationProvider>
                      <PayoutProvider>
                        <SupabaseBookingProvider>
                          <NotificationProvider>
                            <ErrorBoundary>
                              <div className="min-h-screen bg-background">
                                <Routes>
                                  <Route path="/" element={<Home />} />
                                  <Route path="/about" element={<About />} />
                                  <Route path="/contact" element={<Contact />} />
                                  <Route path="/services" element={<Services />} />
                                  <Route path="/auth" element={<Auth />} />
                                  <Route path="/profile" element={<UserProfile />} />
                                  <Route path="/client-dashboard" element={<ClientDashboard />} />
                                  <Route path="/provider-dashboard" element={<ProviderDashboard />} />
                                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                                  <Route path="/service/:id" element={<ServiceDetails />} />
                                  <Route path="/booking" element={<BookingPage />} />
                                  <Route path="/one-off-booking" element={<OneOffBooking />} />
                                  <Route path="/subscription-packages" element={<SubscriptionPackages />} />
                                  <Route path="/search" element={<Search />} />
                                  <Route path="/provider-availability" element={<ProviderAvailability />} />
                                </Routes>
                                <Toaster />
                              </div>
                            </ErrorBoundary>
                          </NotificationProvider>
                        </SupabaseBookingProvider>
                      </PayoutProvider>
                    </LocationProvider>
                  </ServiceProvider>
                </DataProvider>
              </DataModeProvider>
            </UserProvider>
          </AuthProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
