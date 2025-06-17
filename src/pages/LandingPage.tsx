
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, UserCheck, Package, ChevronDown, Star, Shield, Clock, Users, ArrowRight, Menu, X } from "lucide-react";
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
          .from('faqs')
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

  const features = [
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Pick any time that suits your routine."
    },
    {
      icon: UserCheck,
      title: "Verified Providers",
      description: "All cleaners are background-checked and rated."
    },
    {
      icon: Package,
      title: "Custom Packages",
      description: "Pay per job or subscribe weekly/monthly."
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Browse Services",
      description: "View available one-off or package-based cleaning options."
    },
    {
      number: "2",
      title: "Book Instantly",
      description: "Choose your time and location, confirm in seconds."
    },
    {
      number: "3",
      title: "Enjoy Peace of Mind",
      description: "A verified cleaner arrives, and you relax."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm to-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-primary font-heading">Longa</h1>
              <Badge className="bg-accent text-primary hover:bg-accent">
                Pilot Program
              </Badge>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" className="text-text hover:text-primary">
                Services
              </Button>
              <Button variant="ghost" className="text-text hover:text-primary">
                How It Works
              </Button>
              <Button variant="ghost" className="text-text hover:text-primary">
                Contact
              </Button>
              <Button 
                variant="ghost" 
                className="text-text hover:text-primary"
                onClick={() => navigate('/auth')}
              >
                Login
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white font-medium"
                onClick={() => navigate('/auth')}
              >
                Get Started
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
                <Button variant="ghost" className="justify-start text-text hover:text-primary">
                  Services
                </Button>
                <Button variant="ghost" className="justify-start text-text hover:text-primary">
                  How It Works
                </Button>
                <Button variant="ghost" className="justify-start text-text hover:text-primary">
                  Contact
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start text-text hover:text-primary"
                  onClick={() => navigate('/auth')}
                >
                  Login
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={() => navigate('/auth')}
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-text mb-6 font-heading">
              Your Trusted Local{' '}
              <span className="text-primary">Cleaning Experts</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Book top-rated cleaners in your area. Safe, simple, spotless.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto sm:max-w-none">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 font-medium"
                onClick={() => navigate('/auth')}
              >
                Book Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-accent px-8 py-3"
                onClick={() => navigate('/services')}
              >
                Browse Services
              </Button>
            </div>
          </div>
          
          {/* Hero Image Placeholder */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-accent to-primary/20 rounded-2xl p-8 text-center">
              <div className="bg-white/80 rounded-xl p-6">
                <p className="text-gray-600 italic">
                  "Professional cleaning services delivered with care and precision"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-text mb-4 font-heading">How It Works</h2>
            <p className="text-lg sm:text-xl text-gray-600">Simple steps to get your space spotless</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-text mb-2 font-heading">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-text mb-4 font-heading">Why Choose Longa?</h2>
            <p className="text-lg sm:text-xl text-gray-600">Trusted by families across Namibia</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow border-gray-200">
                  <CardContent className="p-6 text-center">
                    <div className="bg-accent p-3 rounded-full w-fit mx-auto mb-4">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-text mb-2 font-heading">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-accent p-4 rounded-full mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-2 font-heading">Verified Providers</h3>
              <p className="text-gray-600">All service providers are thoroughly vetted and background checked</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-accent p-4 rounded-full mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-2 font-heading">Quality Guaranteed</h3>
              <p className="text-gray-600">Read reviews and ratings from real customers in your area</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-accent p-4 rounded-full mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-2 font-heading">Quick Booking</h3>
              <p className="text-gray-600">Book services instantly or schedule for later with our easy platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      {!isLoading && faqs.length > 0 && (
        <section className="py-16 bg-warm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-text mb-4 font-heading">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">Get answers to common questions</p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq) => (
                <Card key={faq.id} className="border-gray-200">
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-text font-heading">{faq.question}</h3>
                      <ChevronDown 
                        className={`h-5 w-5 text-primary transition-transform ${
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
      <section className="py-16 bg-gradient-to-r from-primary to-primary/90">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-heading">Ready to Get Started?</h2>
          <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8">
            Join hundreds of satisfied customers across Namibia
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-gray-100 px-8 py-3 font-medium"
            onClick={() => navigate('/auth')}
          >
            Book Your First Cleaning
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 font-heading">Longa</h3>
              <p className="text-gray-400 mb-4">Your trusted cleaning service platform.</p>
              <Badge variant="outline" className="border-primary text-primary">
                Now piloting in Namibia
              </Badge>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-heading">For Customers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white" onClick={() => navigate('/services')}>Find Services</Button></li>
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white">How It Works</Button></li>
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white">Safety</Button></li>
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white">Support</Button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-heading">For Providers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white" onClick={() => navigate('/auth')}>Become a Cleaner</Button></li>
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white">Provider Resources</Button></li>
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white">Success Stories</Button></li>
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white">Tools & Apps</Button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-heading">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white" onClick={() => navigate('/about')}>About Us</Button></li>
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white">Terms & Conditions</Button></li>
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white">Privacy Policy</Button></li>
                <li><Button variant="link" className="h-auto p-0 text-gray-400 hover:text-white" onClick={() => navigate('/contact')}>Contact</Button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Longa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
