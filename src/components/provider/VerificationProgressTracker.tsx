
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, FileText, CreditCard, Users, Shield } from 'lucide-react';
import { VerificationStatusBadge } from './VerificationStatusBadge';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  completedAt?: string;
}

interface VerificationProgressTrackerProps {
  verificationStatus: string;
  verificationSteps?: VerificationStep[];
  documentsUploaded?: number;
  totalDocuments?: number;
  bankingDetailsComplete?: boolean;
  referencesComplete?: boolean;
  backgroundCheckComplete?: boolean;
}

export const VerificationProgressTracker: React.FC<VerificationProgressTrackerProps> = ({
  verificationStatus,
  verificationSteps,
  documentsUploaded = 0,
  totalDocuments = 4,
  bankingDetailsComplete = false,
  referencesComplete = false,
  backgroundCheckComplete = false
}) => {
  // Default steps if not provided
  const defaultSteps: VerificationStep[] = [
    {
      id: 'documents',
      title: 'Document Upload',
      description: `Upload required verification documents (${documentsUploaded}/${totalDocuments})`,
      icon: FileText,
      status: documentsUploaded === totalDocuments ? 'completed' : documentsUploaded > 0 ? 'in_progress' : 'pending'
    },
    {
      id: 'banking',
      title: 'Banking Details',
      description: 'Provide secure banking information for payouts',
      icon: CreditCard,
      status: bankingDetailsComplete ? 'completed' : 'pending'
    },
    {
      id: 'references',
      title: 'Professional References',
      description: 'Add professional references for verification',
      icon: Users,
      status: referencesComplete ? 'completed' : 'pending'
    },
    {
      id: 'review',
      title: 'Admin Review',
      description: 'Our team reviews your application and documents',
      icon: Shield,
      status: verificationStatus === 'verified' ? 'completed' : 
              verificationStatus === 'under_review' ? 'in_progress' :
              verificationStatus === 'rejected' ? 'failed' : 'pending'
    }
  ];

  const steps = verificationSteps || defaultSteps;
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const getStepIcon = (step: VerificationStep) => {
    const Icon = step.icon;
    const baseClasses = "h-5 w-5";
    
    switch (step.status) {
      case 'completed':
        return <CheckCircle className={`${baseClasses} text-green-600`} />;
      case 'in_progress':
        return <Clock className={`${baseClasses} text-blue-600`} />;
      case 'failed':
        return <AlertCircle className={`${baseClasses} text-red-600`} />;
      default:
        return <Icon className={`${baseClasses} text-gray-400`} />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'in_progress':
        return 'border-blue-200 bg-blue-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Progress
          </CardTitle>
          <VerificationStatusBadge status={verificationStatus} />
        </div>
        <div className="space-y-2">
          <Progress value={progressPercentage} className="w-full" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{completedSteps} of {steps.length} steps completed</span>
            <span>{Math.round(progressPercentage)}% complete</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-colors ${getStepColor(step.status)}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getStepIcon(step)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{step.title}</h4>
                  {step.status === 'completed' && step.completedAt && (
                    <span className="text-xs text-gray-500">
                      Completed {new Date(step.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{step.description}</p>
                {step.status === 'failed' && (
                  <p className="text-sm text-red-600 mt-1">
                    This step needs attention. Please review and resubmit.
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                  step.status === 'completed' 
                    ? 'bg-green-100 border-green-300 text-green-800' 
                    : step.status === 'in_progress'
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : step.status === 'failed'
                    ? 'bg-red-100 border-red-300 text-red-800'
                    : 'bg-gray-100 border-gray-300 text-gray-600'
                }`}>
                  {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>

        {verificationStatus === 'rejected' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Verification Rejected</h4>
                <p className="text-sm text-red-700 mt-1">
                  Your verification was rejected. Please review the feedback and resubmit your application.
                </p>
              </div>
            </div>
          </div>
        )}

        {verificationStatus === 'under_review' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Under Review</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your verification is currently being reviewed. This process typically takes 2-3 business days.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
