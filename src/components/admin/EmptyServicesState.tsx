
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Package } from 'lucide-react';

interface EmptyServicesStateProps {
  onCreateService: () => void;
}

const EmptyServicesState: React.FC<EmptyServicesStateProps> = ({ onCreateService }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-8">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Services Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first service. You can add cleaning services, 
              laundry packages, car care, and more to build your marketplace.
            </p>
          </div>
          
          <Button onClick={onCreateService} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Service
          </Button>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>💡 <strong>Tip:</strong> Start with popular services like home cleaning or laundry to attract your first providers and clients.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmptyServicesState;
