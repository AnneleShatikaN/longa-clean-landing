
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  optional?: boolean;
}

interface OnboardingFlowProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip?: () => void;
  userRole: 'client' | 'provider' | 'admin';
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  steps,
  onComplete,
  onSkip,
  userRole
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = completedSteps.has(currentStep) || steps[currentStep].optional;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const markStepComplete = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'client': return 'bg-blue-600';
      case 'provider': return 'bg-green-600';
      case 'admin': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="flex items-center">
              Welcome to the platform!
              <Badge className={`ml-2 ${getRoleColor(userRole)} text-white`}>
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
            </CardTitle>
            {onSkip && (
              <Button variant="ghost" onClick={onSkip}>
                Skip Setup
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h3>
            <p className="text-gray-600">
              {steps[currentStep].description}
            </p>
          </div>

          <div className="min-h-[300px] flex items-center justify-center">
            {steps[currentStep].content}
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              {steps[currentStep].optional && !completedSteps.has(currentStep) && (
                <Button variant="ghost" onClick={handleNext}>
                  Skip
                </Button>
              )}
              
              {!completedSteps.has(currentStep) && !steps[currentStep].optional && (
                <Button onClick={markStepComplete}>
                  <Check className="h-4 w-4 mr-1" />
                  Mark Complete
                </Button>
              )}

              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="min-w-[100px]"
              >
                {isLastStep ? 'Get Started' : 'Next'}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center space-x-2 pt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep
                    ? getRoleColor(userRole)
                    : completedSteps.has(index)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
