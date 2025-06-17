
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProviderAvailabilityManager } from '@/components/provider/ProviderAvailabilityManager';
import { ProviderSpecializationManager } from '@/components/provider/ProviderSpecializationManager';

const ProviderAvailability = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user || user.role !== 'provider') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">This page is only accessible to service providers</p>
          <Button onClick={() => navigate('/auth')}>
            Sign In as Provider
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Provider Settings</h1>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="availability" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="availability">Availability & Schedule</TabsTrigger>
              <TabsTrigger value="specializations">Service Specializations</TabsTrigger>
            </TabsList>

            <TabsContent value="availability">
              <ProviderAvailabilityManager />
            </TabsContent>

            <TabsContent value="specializations">
              <ProviderSpecializationManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProviderAvailability;
