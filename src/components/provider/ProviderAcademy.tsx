
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Play, 
  CheckCircle, 
  Lock, 
  Download,
  FileText,
  Youtube,
  Award
} from 'lucide-react';
import { useProviderLearning } from '@/hooks/useProviderLearning';
import { ModuleViewer } from './ModuleViewer';
import { CertificateDisplay } from './CertificateDisplay';
import { EnhancedLoading } from '@/components/ui/enhanced-loading';

export const ProviderAcademy = () => {
  const {
    modules,
    certificate,
    isLoading,
    error,
    providerServiceType,
    getProgressStats,
    generateCertificatePDF
  } = useProviderLearning();

  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  const progressStats = getProgressStats();

  const handleDownloadCertificate = async () => {
    if (certificate) {
      const pdfUrl = await generateCertificatePDF();
      if (pdfUrl) {
        window.open(pdfUrl, '_blank');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <EnhancedLoading message="Loading your academy..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <p className="text-red-800">Error loading academy: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!providerServiceType) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <div className="text-center">
            <GraduationCap className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Service Type Required
            </h3>
            <p className="text-yellow-700">
              Please select your service category in your profile to access the academy.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show module viewer if a module is selected
  if (selectedModuleId) {
    const selectedModule = modules.find(m => m.id === selectedModuleId);
    if (selectedModule) {
      return (
        <ModuleViewer
          module={selectedModule}
          onBack={() => setSelectedModuleId(null)}
        />
      );
    }
  }

  // Show certificate if requested
  if (showCertificate && certificate) {
    return (
      <CertificateDisplay
        certificate={certificate}
        providerName={""} // Will be filled from user context
        onBack={() => setShowCertificate(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Longa Academy
        </h1>
        <p className="text-lg text-gray-600">
          {providerServiceType?.charAt(0).toUpperCase() + providerServiceType?.slice(1)} Training Program
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {progressStats.completedModules} of {progressStats.totalModules} modules completed
            </span>
            <span className="text-sm text-gray-600">
              {progressStats.progressPercentage}%
            </span>
          </div>
          <Progress value={progressStats.progressPercentage} className="h-2" />
          
          {progressStats.isCompleted && certificate && (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    Congratulations! Training Complete
                  </p>
                  <p className="text-sm text-green-600">
                    Certificate ID: {certificate.certificate_id}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCertificate(true)}
                >
                  View Certificate
                </Button>
                <Button
                  size="sm"
                  onClick={handleDownloadCertificate}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modules List */}
      <div className="grid gap-4">
        {modules.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No training modules available for {providerServiceType} yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          modules.map((module, index) => {
            const isCompleted = module.progress?.is_completed || false;
            const canAccess = index === 0 || modules[index - 1]?.progress?.is_completed;

            return (
              <Card
                key={module.id}
                className={`transition-all ${
                  canAccess 
                    ? 'hover:shadow-md cursor-pointer' 
                    : 'opacity-60 cursor-not-allowed'
                } ${
                  isCompleted ? 'border-green-200 bg-green-50' : ''
                }`}
                onClick={() => canAccess && setSelectedModuleId(module.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-100 text-green-600' 
                          : canAccess 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : canAccess ? (
                          <Play className="h-5 w-5" />
                        ) : (
                          <Lock className="h-5 w-5" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          Module {index + 1}: {module.title}
                        </h3>
                        {module.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {module.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 mt-2">
                          {module.youtube_url && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Youtube className="h-3 w-3" />
                              Video
                            </div>
                          )}
                          {module.notes && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FileText className="h-3 w-3" />
                              Notes
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {module.progress && (
                        <Badge variant={isCompleted ? 'default' : 'secondary'}>
                          {isCompleted ? 'Completed' : `${module.progress.quiz_score}%`}
                        </Badge>
                      )}
                      
                      {!canAccess && (
                        <Badge variant="outline">
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Verification Notice */}
      {progressStats.isCompleted && certificate && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-800">
                  Ready for Verification
                </h3>
                <p className="text-blue-700 mt-1">
                  You can now proceed to upload your verification documents to complete your provider registration.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
