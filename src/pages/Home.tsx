
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ServiceGrid } from '@/components/services/ServiceGrid';
import { useAuth } from '@/contexts/AuthContext';
import { useServicesEnhanced } from '@/hooks/useServicesEnhanced';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  Shield,
  Clock,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  Home as HomeIcon,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { services, isLoading } = useServicesEnhanced();
  const { notifyBookingSuccess } = useEnhancedNotifications();

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (user) {
      navigate(`/service/${serviceId}`);
      if (service) {
        notifyBookingSuccess(service.name);
      }
    } else {
      navigate('/auth');
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">Longa Clean</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection('services')}
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                Contact
              </button>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={() => navigate('/client-dashboard')}>
                    Dashboard
                  </Button>
                  <Button onClick={() => navigate('/search')}>
                    Book Service
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={() => navigate('/auth')}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/auth')}>
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Professional Cleaning
              <span className="text-purple-600 block">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Book reliable, professional cleaning services in Windhoek and beyond. 
              From one-time deep cleans to convenient subscription packages.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                    onClick={() => navigate('/search')}
                  >
                    Book Service Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-lg px-8 py-6 border-purple-200 text-purple-700 hover:bg-purple-50"
                    onClick={() => navigate('/subscription-packages')}
                  >
                    View Packages
                    <Package className="ml-2 h-5 w-5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                    onClick={() => navigate('/auth')}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-lg px-8 py-6 border-purple-200 text-purple-700 hover:bg-purple-50"
                    onClick={() => scrollToSection('services')}
                  >
                    View Services
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Longa Clean?
            </h2>
            <p className="text-xl text-gray-600">
              Professional, reliable, and convenient cleaning services
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Verified Professionals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  All our service providers are background checked, trained, and insured for your peace of mind.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Flexible Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Book services at your convenience with flexible time slots and emergency booking options.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Quality Guaranteed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  100% satisfaction guarantee with quality assurance checks and customer support.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600">
              Professional cleaning solutions for every need
            </p>
          </div>

          <ServiceGrid
            maxItems={6}
            onServiceSelect={handleServiceSelect}
            showBookingButton={true}
            className="mb-8"
          />

          <div className="text-center">
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/services')}
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              View All Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-purple-600 text-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-purple-200">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-purple-200">Service Providers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-purple-200">Completed Jobs</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9</div>
              <div className="text-purple-200">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About Longa Clean
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We're Namibia's premier cleaning service platform, connecting customers with 
                verified professional cleaners across Windhoek and surrounding areas.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Licensed and insured service providers</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Eco-friendly cleaning products available</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>24/7 customer support</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Flexible payment options</span>
                </li>
              </ul>
            </div>
            <div className="bg-purple-100 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <HomeIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Residential</h3>
                  <p className="text-sm text-gray-600">Home cleaning services</p>
                </div>
                <div className="text-center">
                  <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Commercial</h3>
                  <p className="text-sm text-gray-600">Office & business cleaning</p>
                </div>
                <div className="text-center">
                  <Package className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Packages</h3>
                  <p className="text-sm text-gray-600">Subscription plans</p>
                </div>
                <div className="text-center">
                  <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Emergency</h3>
                  <p className="text-sm text-gray-600">Same-day booking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600">
              Ready to book or have questions? We're here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8">
                <Phone className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Phone</h3>
                <p className="text-gray-600">+264 81 234 5678</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8">
                <Mail className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-gray-600">hello@longaclean.na</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8">
                <MapPin className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Service Areas</h3>
                <p className="text-gray-600">Windhoek & Surrounding Areas</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg"
              onClick={() => navigate('/contact')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              Contact Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold">Longa Clean</span>
              </div>
              <p className="text-gray-400">
                Professional cleaning services across Namibia.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('services')}>House Cleaning</button></li>
                <li><button onClick={() => scrollToSection('services')}>Deep Cleaning</button></li>
                <li><button onClick={() => scrollToSection('services')}>Office Cleaning</button></li>
                <li><button onClick={() => navigate('/subscription-packages')}>Packages</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('about')}>About Us</button></li>
                <li><button onClick={() => navigate('/contact')}>Contact</button></li>
                <li><button onClick={() => navigate('/auth')}>Careers</button></li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => navigate('/contact')}>Help Center</button></li>
                <li>+264 81 234 5678</li>
                <li>hello@longaclean.na</li>
                <li>Mon-Fri: 8AM-6PM</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Longa Clean. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
