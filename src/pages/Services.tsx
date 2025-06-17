
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LocationSelector } from '@/components/location/LocationSelector';

const Services = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const serviceCategories = [
    {
      title: "Home Cleaning",
      description: "Professional cleaning services for your home",
      icon: "🏠"
    },
    {
      title: "Plumbing",
      description: "Expert plumbing repairs and installations",
      icon: "🔧"
    },
    {
      title: "Electrical",
      description: "Safe and reliable electrical services",
      icon: "⚡"
    },
    {
      title: "Gardening",
      description: "Garden maintenance and landscaping",
      icon: "🌱"
    },
    {
      title: "Handyman",
      description: "General repairs and maintenance",
      icon: "🔨"
    },
    {
      title: "Painting",
      description: "Interior and exterior painting services",
      icon: "🎨"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Our Services</h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover the wide range of services available in your area
          </p>
          
          <div className="flex justify-center mb-8">
            <LocationSelector />
          </div>
          
          {user ? (
            <Button onClick={() => navigate('/search')} size="lg">
              Browse & Book Services
            </Button>
          ) : (
            <Button onClick={() => navigate('/auth')} size="lg">
              Sign In to Book Services
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {serviceCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="text-4xl mb-4">{category.icon}</div>
                <CardTitle>{category.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-4">
                  {category.description}
                </p>
                {user && (
                  <Button 
                    onClick={() => navigate('/search')} 
                    variant="outline" 
                    className="w-full"
                  >
                    View Services
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
