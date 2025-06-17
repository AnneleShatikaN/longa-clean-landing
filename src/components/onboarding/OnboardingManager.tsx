
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingWizard } from './OnboardingWizard';
import { supabase } from '@/integrations/supabase/client';

export const OnboardingManager: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || user.role !== 'client') {
        setIsLoading(false);
        return;
      }

      try {
        // Check if user has completed onboarding - using users table instead of profiles
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('created_at')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setIsLoading(false);
          return;
        }

        // Show onboarding if:
        // User is very new (created in last 3 days) - simplified logic since onboarding_completed doesn't exist yet
        const userCreated = new Date(userProfile.created_at || '');
        const now = new Date();
        const daysSinceCreation = (now.getTime() - userCreated.getTime()) / (1000 * 60 * 60 * 24);
        
        const shouldShowOnboarding = daysSinceCreation <= 3;
        
        setShowOnboarding(shouldShowOnboarding);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const handleComplete = async () => {
    setShowOnboarding(false);
    
    // For now, just hide onboarding - we'll implement completion tracking when the DB migration is applied
    console.log('Onboarding completed for user:', user?.id);
  };

  const handleManualTrigger = () => {
    setShowOnboarding(true);
  };

  // Expose manual trigger function globally for development/testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).triggerOnboarding = handleManualTrigger;
    }
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <OnboardingWizard
      isOpen={showOnboarding}
      onClose={() => setShowOnboarding(false)}
      onComplete={handleComplete}
    />
  );
};
