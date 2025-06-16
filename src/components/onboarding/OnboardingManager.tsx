
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingWizard } from './OnboardingWizard';

export const OnboardingManager: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if user is new and hasn't completed onboarding
    if (user && user.role === 'client') {
      // You can add logic here to check if user has completed onboarding
      // For now, we'll show it for new users (created in last 24 hours)
      const userCreated = new Date(user.created_at || '');
      const now = new Date();
      const daysSinceCreation = (now.getTime() - userCreated.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceCreation < 1) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const handleComplete = () => {
    setShowOnboarding(false);
    // You can save onboarding completion status here
  };

  return (
    <OnboardingWizard
      isOpen={showOnboarding}
      onClose={() => setShowOnboarding(false)}
      onComplete={handleComplete}
    />
  );
};
