
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle } from 'lucide-react';
import { CompanySetup } from './CompanySetup';
import { PaymentSetup } from './PaymentSetup';
import { NotificationSetup } from './NotificationSetup';
import { BusinessRulesSetup } from './BusinessRulesSetup';
import { AdminAccountSetup } from './AdminAccountSetup';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  completed: boolean;
}

const initialSteps: SetupStep[] = [
  {
    id: 'company',
    title: 'Company Information',
    description: 'Set up Longa branding and contact details',
    component: CompanySetup,
    completed: false,
  },
  {
    id: 'payment',
    title: 'Payment Gateway',
    description: 'Configure payment processing',
    component: PaymentSetup,
    completed: false,
  },
  {
    id: 'notifications',
    title: 'Notification Settings',
    description: 'Set up email and SMS providers',
    component: NotificationSetup,
    completed: false,
  },
  {
    id: 'business',
    title: 'Business Rules',
    description: 'Configure booking and cancellation policies',
    component: BusinessRulesSetup,
    completed: false,
  },
  {
    id: 'admin',
    title: 'Admin Account',
    description: 'Create initial admin account',
    component: AdminAccountSetup,
    completed: false,
  },
];

export const SetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(initialSteps);

  const progress = (steps.filter(step => step.completed).length / steps.length) * 100;

  const handleStepComplete = () => {
    const updatedSteps = [...steps];
    updatedSteps[currentStep].completed = true;
    setSteps(updatedSteps);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepClick = (index: number) => {
    if (index <= currentStep || steps[index].completed) {
      setCurrentStep(index);
    }
  };

  const CurrentComponent = steps[currentStep].component;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Longa Setup Wizard</CardTitle>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length} - {Math.round(progress)}% complete
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            {/* Steps sidebar */}
            <div className="space-y-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    index === currentStep
                      ? 'border-blue-500 bg-blue-50'
                      : step.completed
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Current step content */}
            <div className="md:col-span-3">
              <div className="mb-6">
                <h3 className="text-xl font-semibold">{steps[currentStep].title}</h3>
                <p className="text-gray-600">{steps[currentStep].description}</p>
              </div>

              <CurrentComponent onComplete={handleStepComplete} />

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                
                {currentStep === steps.length - 1 ? (
                  <Button
                    onClick={handleStepComplete}
                    disabled={!steps[currentStep].completed}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Complete Setup
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                    disabled={!steps[currentStep].completed}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
