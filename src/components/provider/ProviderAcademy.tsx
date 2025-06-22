
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  FileText,
  Award,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLearningModules } from '@/hooks/useLearningModules';

export const ProviderAcademy: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  // Check if provider category is set
  useEffect(() => {
    if (user && user.role === 'provider' && !user.provider_category) {
      console.log('Provider category not set, redirecting to profile');
      navigate('/provider-profile', { 
        state: { 
          message: 'Please set your provider category to access training materials',
          highlightCategory: true 
        }
      });
    }
  }, [user, navigate]);

  const {
    modules,
    isLoading,
    error,
    fetchModules
  } = useLearningModules();

  // Fetch modules when component mounts and provider category is available
  useEffect(() => {
    if (user?.provider_category) {
      fetchModules();
    }
  }, [user?.provider_category, fetchModules]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show error if no provider category
  if (!user?.provider_category) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>Provider category not set. Please update your profile first.</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/provider-profile')}
              >
                Go to Profile
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>Error loading training modules: {error}</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fetchModules()}
              >
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalModules = modules?.length || 0;
  const progressPercentage = 0; // For now, we'll show 0% progress

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Provider Academy</h1>
          <p className="text-gray-600">
            Complete training for {user.provider_category?.replace('_', ' ')} services
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Training Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">
                0 of {totalModules} modules completed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList>
          <TabsTrigger value="modules">Training Modules</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <div className="grid gap-4">
            {modules?.map((module) => (
              <Card key={module.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{module.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          Module content
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          Training material
                        </span>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <Button
                        size="sm"
                        onClick={() => setSelectedModule(module.id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {totalModules === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">No Training Modules Available</h3>
                  <p className="text-gray-600">
                    Training modules for {user.provider_category?.replace('_', ' ')} are not yet available.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="certificates">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No Certificates Yet</h3>
                <p className="text-gray-600">
                  Complete all training modules to earn your certificate
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
