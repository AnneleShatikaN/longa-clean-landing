
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Clock, 
  Shield, 
  Star,
  Home,
  Zap,
  Users,
  CheckCircle,
  MessageCircle
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6 font-['Inter']">
          Professional Home Services in <span className="text-blue-600">Namibia</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Connect with verified service providers for all your home cleaning and maintenance needs. 
          Quality service, trusted professionals, seamless booking.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/services')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg"
          >
            Browse Services
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/auth')}
            className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-full text-lg"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 font-['Inter']">
          Why Choose Our Platform?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="font-['Inter']">Verified Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                All service providers are background-checked and verified for your safety and peace of mind.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="font-['Inter']">Flexible Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Book services at your convenience with flexible scheduling options that fit your lifestyle.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-purple-100 p-4 rounded-full w-fit mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="font-['Inter']">Quality Guaranteed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Rate and review services to ensure consistently high-quality experiences for everyone.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 font-['Inter']">
            Popular Services
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <Home className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="font-['Inter']">Home Cleaning</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Professional house cleaning services for busy homeowners.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/services')}
                  className="w-full"
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="bg-purple-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="font-['Inter']">Deep Cleaning</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Thorough deep cleaning for a spotless and sanitized home.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/services')}
                  className="w-full"
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="font-['Inter']">Move-in/Move-out</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Specialized cleaning services for moving transitions.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/services')}
                  className="w-full"
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 font-['Inter']">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-600 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold mb-3 font-['Inter']">Choose Your Service</h3>
            <p className="text-gray-600">
              Browse our range of professional home services and select what you need.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-600 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold mb-3 font-['Inter']">Book & Pay</h3>
            <p className="text-gray-600">
              Schedule your service at a convenient time and make secure payment.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-600 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold mb-3 font-['Inter']">Enjoy Quality Service</h3>
            <p className="text-gray-600">
              Relax while our verified professionals take care of your home.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 font-['Inter']">
            Ready to Experience Professional Home Services?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers across Namibia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/services')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-full text-lg"
            >
              Book Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/auth')}
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-full text-lg"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 font-['Inter']">
            Contact Us
          </h2>
          <div className="max-w-md mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-gray-600 mb-4">Contact us via WhatsApp:</p>
                <a 
                  href="https://wa.me/264814124606" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 font-semibold text-lg hover:underline"
                >
                  +264 81 412 4606
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
