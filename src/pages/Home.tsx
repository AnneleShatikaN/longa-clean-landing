
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Home Services Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with trusted service providers in your area for all your home and business needs.
          </p>
          
          {user ? (
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/search')} size="lg">
                Browse Services
              </Button>
              <Button onClick={() => navigate('/client-dashboard')} variant="outline" size="lg">
                Dashboard
              </Button>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/auth')} size="lg">
                Get Started
              </Button>
              <Button onClick={() => navigate('/services')} variant="outline" size="lg">
                View Services
              </Button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Easy Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Book services quickly and easily through our intuitive platform.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Trusted Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                All our service providers are verified and highly rated by customers.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Location-Based</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Find services available in your specific area across Namibia.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
