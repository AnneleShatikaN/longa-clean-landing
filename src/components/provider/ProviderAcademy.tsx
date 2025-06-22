
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
import { useProviderLearning } from '@/hooks/useProviderLearning';
import { ModuleViewer } from './ModuleViewer';

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
          highlightCategory: true,
          from: 'academy'
        }
      });
    }
  }, [user, navigate]);

  const {
    modules,
    certificate,
    isLoading,
    error,
    getProgressStats,
    refreshData
  } = useProviderLearning();

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
                onClick={() => navigate('/provider-profile', {
                  state: { 
                    message: 'Please set your provider category to access training materials',
                    highlightCategory: true,
                    from: 'academy'
                  }
                })}
              >
                Go to Profile
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading academy content...</span>
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
                onClick={() => refreshData()}
              >
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show module viewer if a module is selected
  if (selectedModule) {
    const module = modules.find(m => m.id === selectedModule);
    if (module) {
      return (
        <ModuleViewer 
          module={module} 
          onBack={() => setSelectedModule(null)} 
        />
      );
    }
  }

  const progressStats = getProgressStats();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Longa Academy</h1>
          <p className="text-gray-600">
            Complete training for {user.provider_category?.replace('_', ' ')} services
          </p>
        </div>
        {certificate && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Award className="h-4 w-4 mr-1" />
            Certified
          </Badge>
        )}
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
                {progressStats.completedModules} of {progressStats.totalModules} modules completed
              </span>
            </div>
            <Progress value={progressStats.progressPercentage} className="h-2" />
            
            {progressStats.isCompleted && (
              <Alert className="border-green-200 bg-green-50">
                <Award className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Congratulations!</strong> You have completed all training modules and earned your certificate.
                  You can now proceed to document verification.
                </AlertDescription>
              </Alert>
            )}
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
            {modules.map((module) => (
              <Card key={module.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{module.title}</h3>
                        {module.progress?.is_completed && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          Training content
                        </span>
                        {module.progress?.quiz_score && (
                          <span className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            Score: {module.progress.quiz_score}%
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <Button
                        size="sm"
                        onClick={() => setSelectedModule(module.id)}
                        variant={module.progress?.is_completed ? "outline" : "default"}
                      >
                        {module.progress?.is_completed ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Review
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Start
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {modules.length === 0 && (
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
            {certificate ? (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Award className="h-5 w-5" />
                    Longa Academy Certificate
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-700">Certificate ID:</span>
                      <p className="text-green-800">{certificate.certificate_id}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Issued Date:</span>
                      <p className="text-green-800">
                        {new Date(certificate.issued_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Service Type:</span>
                      <p className="text-green-800">
                        {certificate.service_type.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Status:</span>
                      <p className="text-green-800">Active</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-green-200">
                    <Button 
                      onClick={() => navigate('/provider-verification')}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Proceed to Document Verification
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">No Certificate Yet</h3>
                  <p className="text-gray-600">
                    Complete all training modules with 80%+ score to earn your certificate
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
