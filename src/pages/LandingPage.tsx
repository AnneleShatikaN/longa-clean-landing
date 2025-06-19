
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, UserCheck, Package, ChevronDown, Star, Shield, Clock, Users, ArrowRight, Menu, X, Home, Sparkles, Zap } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
}

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Redirect authenticated users to their dashboard
      if (user.role === 'client') {
        navigate('/client-dashboard');
      } else if (user.role === 'provider') {
        navigate('/provider-dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin-dashboard');
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const { data, error } = await supabase
          .from('support_faqs')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setFaqs(data || []);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const toggleFaq = (faqId: string) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const services = [
    {
      icon: Home,
      title: "Home Cleaning",
      description: "Regular house cleaning, weekly or monthly",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Sparkles,
      title: "Move-In Help",
      description: "Deep cleaning for new homes and apartments",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Zap,
      title: "Deep Clean",
      description: "Intensive cleaning for special occasions",
      color: "bg-purple-100 text-purple-600"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Choose Location",
      description: "Select your area in Namibia"
    },
    {
      number: "2",
      title: "Pick Service",
      description: "Browse cleaning options that fit your needs"
    },
    {
      number: "3",
      title: "Confirm & Pay",
      description: "Pick your time and confirm booking"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent font-['Inter']">
                Longa
              </h1>
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                Beta
              </Badge>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" className="text-gray-700 hover:text-purple-600" onClick={() => navigate('/services')}>
                Services
              </Button>
              <Button variant="ghost" className="text-gray-700 hover:text-purple-600" onClick={() => navigate('/subscription-packages')}>
                Packages
              </Button>
              <Button variant="ghost" className="text-gray-700 hover:text-purple-600" onClick={() => navigate('/contact')}>
                Contact
              </Button>
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-purple-600"
                onClick={() => navigate('/auth')}
              >
                Login
              </Button>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-full px-6"
                onClick={() => navigate('/auth')}
              >
                My Dashboard
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-3">
                <Button variant="ghost" className="justify-start text-gray-700 hover:text-purple-600" onClick={() => navigate('/services')}>
                  Services
                </Button>
                <Button variant="ghost" className="justify-start text-gray-700 hover:text-purple-600" onClick={() => navigate('/subscription-packages')}>
                  Packages
                </Button>
                <Button variant="ghost" className="justify-start text-gray-700 hover:text-purple-600" onClick={() => navigate('/contact')}>
                  Contact
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start text-gray-700 hover:text-purple-600"
                  onClick={() => navigate('/auth')}
                >
                  Login
                </Button>
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full"
                  onClick={() => navigate('/auth')}
                >
                  My Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 font-['Inter']">
            Book Trusted Local{' '}
            <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Cleaning Help
            </span>
            {' '}in Minutes
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with verified local cleaners across Namibia. Safe, simple, spotless.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto sm:max-w-none">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-full text-lg font-medium"
              onClick={() => navigate('/services')}
            >
              Explore Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-4 rounded-full text-lg"
              onClick={() => navigate('/subscription-packages')}
            >
              See Packages
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 font-['Inter']">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">Simple steps to get your space spotless</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 font-['Inter']">{step.title}</h3>
                <p className="text-gray-600 text-lg">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 font-['Inter']">
              Our Services
            </h2>
            <p className="text-xl text-gray-600">Professional cleaning services for every need</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:scale-105">
                  <CardContent className="p-8 text-center">
                    <div className={`${service.color} p-4 rounded-full w-fit mx-auto mb-6`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 font-['Inter']">{service.title}</h3>
                    <p className="text-gray-600 mb-6">{service.description}</p>
                    <Button 
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full px-6"
                      onClick={() => navigate('/services')}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Banner */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-6 rounded-full mb-6">
                <Shield className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 font-['Inter']">Verified Providers</h3>
              <p className="text-gray-600">All service providers are thoroughly vetted and background checked</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-6 rounded-full mb-6">
                <Star className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 font-['Inter']">Quality Guaranteed</h3>
              <p className="text-gray-600">Read reviews and ratings from real customers in your area</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-6 rounded-full mb-6">
                <Clock className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 font-['Inter']">Quick Booking</h3>
              <p className="text-gray-600">Book services instantly or schedule for later with our easy platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      {!isLoading && faqs.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-purple-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 font-['Inter']">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">Get answers to common questions</p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq) => (
                <Card key={faq.id} className="border-0 shadow-md">
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-6 text-left flex justify-between items-center hover:bg-purple-50 transition-colors rounded-lg"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 font-['Inter']">{faq.question}</h3>
                      <ChevronDown 
                        className={`h-5 w-5 text-purple-600 transition-transform ${
                          expandedFaq === faq.id ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="px-6 pb-6">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-purple-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 font-['Inter']">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join hundreds of satisfied customers across Namibia
          </p>
          <Button 
            size="lg" 
            className="bg-white text-purple-700 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-medium shadow-lg"
            onClick={() => navigate('/auth')}
          >
            Book Your First Cleaning
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-6 font-['Inter'] bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Longa
              </h3>
              <p className="text-gray-400 mb-4">Your trusted cleaning service platform.</p>
              <Badge variant="outline" className="border-purple-400 text-purple-400">
                Now serving Namibia
              </Badge>
            </div>
            <div>
              <h4 className="font-semibold mb-6 font-['Inter']">For Customers</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white" onClick={() => navigate('/services')}>Find Services</Button></li>
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white" onClick={() => navigate('/subscription-packages')}>Packages</Button></li>
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white">Safety</Button></li>
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white">Support</Button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 font-['Inter']">For Providers</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white" onClick={() => navigate('/auth')}>Become a Cleaner</Button></li>
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white">Provider Resources</Button></li>
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white">Success Stories</Button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 font-['Inter']">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white" onClick={() => navigate('/about')}>About Us</Button></li>
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white">Terms & Conditions</Button></li>
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white">Privacy Policy</Button></li>
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white" onClick={() => navigate('/contact')}>Contact</Button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Longa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
