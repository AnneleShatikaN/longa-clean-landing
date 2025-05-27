
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, User, LogIn, Check, ChevronDown } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-white">Longa</span>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
            <Button className="bg-white text-purple-600 hover:bg-gray-100">
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto">
          {/* Trust Badge */}
          <Badge className="bg-white/20 text-white border-white/30 mb-8 px-4 py-2 text-sm">
            <Check className="w-4 h-4 mr-2" />
            Trusted by 1000+ Namibians
          </Badge>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Get Your Space Cleaned by{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Trusted Local Cleaners
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-purple-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Professional cleaning services across Namibia. Connect with verified cleaners in your area for homes, offices, and commercial spaces.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
              Book Cleaning Service
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-3 text-lg font-semibold">
              Become a Cleaner
            </Button>
            <Button size="lg" variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 px-8 py-3 text-lg font-semibold">
              Admin Access
            </Button>
          </div>

          {/* Demo Account Access */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-16 border border-white/20">
            <h3 className="text-2xl font-semibold text-white mb-4">Demo Account Access</h3>
            <p className="text-purple-100 mb-6">Test different user roles and explore the platform</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <User className="w-4 h-4 mr-2" />
                Customer Demo
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Home className="w-4 h-4 mr-2" />
                Cleaner Demo
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Check className="w-4 h-4 mr-2" />
                Admin Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Services Overview */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Home Cleaning</h3>
                <p className="text-purple-100">Professional residential cleaning services for your home, apartment, or living space.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Office Cleaning</h3>
                <p className="text-purple-100">Keep your workplace spotless with our commercial cleaning solutions for offices.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Deep Cleaning</h3>
                <p className="text-purple-100">Comprehensive deep cleaning services for move-ins, move-outs, and special occasions.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="text-center mt-16">
          <ChevronDown className="w-8 h-8 text-white/60 mx-auto animate-bounce" />
        </div>
      </main>
    </div>
  );
};

export default Index;
