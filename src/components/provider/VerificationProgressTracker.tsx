
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, FileText, CreditCard, Users } from 'lucide-react';

interface VerificationProgressTrackerProps {
  verificationStatus: string;
  documentsUploaded: number;
  totalDocuments: number;
  bankingDetailsComplete: boolean;
  referencesComplete: boolean;
}

export const VerificationProgressTracker: React.FC<VerificationProgressTrackerProps> = ({
  verificationStatus,
  documentsUploaded,
  totalDocuments,
  bankingDetailsComplete,
  referencesComplete
}) => {
  const steps = [
    {
      id: 'documents',
      label: 'Upload Documents',
      icon: FileText,
      completed: documentsUploaded >= totalDocuments,
      progress: Math.min((documentsUploaded / totalDocuments) * 100, 100)
    },
    {
      id: 'banking',
      label: 'Banking Details',
      icon: CreditCard,
      completed: bankingDetailsComplete,
      progress: bankingDetailsComplete ? 100 : 0
    },
    {
      id: 'references',
      label: 'Professional References',
      icon: Users,
      completed: referencesComplete,
      progress: referencesComplete ? 100 : 0
    }
  ];

  const overallProgress = steps.reduce((acc, step) => acc + step.progress, 0) / steps.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Verification Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-gray-600">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  step.completed 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium ${
                      step.completed ? 'text-green-800' : 'text-gray-700'
                    }`}>
                      {step.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {step.completed ? 'Complete' : 'Pending'}
                    </span>
                  </div>
                  <Progress value={step.progress} className="h-1" />
                </div>
              </div>
            );
          })}
        </div>

        {verificationStatus === 'under_review' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ✅ All requirements completed! Your application is now under review.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
