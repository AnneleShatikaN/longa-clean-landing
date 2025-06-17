
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">About Us</h1>
            <p className="text-xl text-gray-600">
              Connecting communities with trusted service providers across Namibia
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  To make quality home and business services accessible to everyone by connecting 
                  customers with skilled, trusted service providers in their local area.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  To be Namibia's leading platform for service bookings, empowering both 
                  customers and service providers through technology and trust.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button onClick={() => navigate('/services')} size="lg">
              Explore Our Services
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
