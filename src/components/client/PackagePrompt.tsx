
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PackagePromptProps {
  onUpgrade?: () => void;
}

export const PackagePrompt: React.FC<PackagePromptProps> = ({ onUpgrade }) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/subscription-packages');
    }
  };

  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Package className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-xl text-gray-900">Subscribe to Access Services</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-gray-600 mb-6">
          You need an active package to book services. Choose from our flexible subscription packages
          to get started with professional services.
        </p>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Lock className="h-4 w-4" />
              <span>Premium Services</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Lock className="h-4 w-4" />
              <span>Flexible Scheduling</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Lock className="h-4 w-4" />
              <span>24/7 Support</span>
            </div>
          </div>
          
          <Button onClick={handleUpgrade} className="w-full sm:w-auto">
            <ArrowRight className="h-4 w-4 mr-2" />
            Browse Packages
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
