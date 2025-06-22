
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
import { ModuleViewer } from './ModuleViewer';
import { CertificateDisplay } from './CertificateDisplay';

export const ProviderAcademy: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

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
    progress,
    certificates,
    isLoading,
    startModule,
    completeModule,
    submitQuiz,
    refetch
  } = useLearningModules(user?.provider_category as any);

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

  const completedModules = progress?.filter(p => p.is_completed).length || 0;
  const totalModules = modules?.length || 0;
  const progressPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
  const hasActiveCertificate = certificates?.some(cert => cert.is_active);

  if (selectedModule) {
    return (
      <ModuleViewer
        moduleId={selectedModule}
        onComplete={() => {
          setSelectedModule(null);
          refetch();
        }}
        onBack={() => setSelectedModule(null)}
      />
    );
  }

  if (showCertificate && hasActiveCertificate) {
    return (
      <CertificateDisplay
        serviceType={user.provider_category as any}
        onBack={() => setShowCertificate(false)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Provider Academy</h1>
          <p className="text-gray-600">
            Complete training for {user.provider_category?.replace('_', ' ')} services
          </p>
        </div>
        {hasActiveCertificate && (
          <Button onClick={() => setShowCertificate(true)} variant="outline">
            <Award className="h-4 w-4 mr-2" />
            View Certificate
          </Button>
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
                {completedModules} of {totalModules} modules completed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            
            {progressPercentage === 100 && !hasActiveCertificate && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Congratulations! You've completed all training modules. Your certificate will be generated shortly.
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
            {modules?.map((module) => {
              const moduleProgress = progress?.find(p => p.module_id === module.id);
              const isCompleted = moduleProgress?.is_completed || false;
              const canStart = true; // For now, allow all modules to be started

              return (
                <Card key={module.id} className={isCompleted ? 'border-green-200' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{module.title}</h3>
                          {isCompleted && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {module.content_sections?.length || 0} sections
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {module.estimated_duration} min
                          </span>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {isCompleted ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedModule(module.id)}
                          >
                            Review
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            disabled={!canStart}
                            onClick={() => setSelectedModule(module.id)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {moduleProgress ? 'Continue' : 'Start'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="certificates">
          <div className="space-y-4">
            {certificates && certificates.length > 0 ? (
              certificates.map((cert) => (
                <Card key={cert.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{cert.service_type.replace('_', ' ')} Certificate</h3>
                        <p className="text-sm text-gray-600">
                          Issued: {new Date(cert.issued_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Certificate ID: {cert.certificate_id}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={cert.is_active ? "default" : "secondary"}>
                          {cert.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCertificate(true)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">No Certificates Yet</h3>
                  <p className="text-gray-600">
                    Complete all training modules to earn your certificate
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
