
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
        // Check if user has completed onboarding
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed, created_at')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setIsLoading(false);
          return;
        }

        // Show onboarding if:
        // 1. User hasn't completed onboarding, OR
        // 2. User is very new (created in last 3 days) and hasn't completed onboarding
        const userCreated = new Date(profile.created_at || user.created_at || '');
        const now = new Date();
        const daysSinceCreation = (now.getTime() - userCreated.getTime()) / (1000 * 60 * 60 * 24);
        
        const shouldShowOnboarding = !profile.onboarding_completed && daysSinceCreation <= 3;
        
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
    
    // Update the profile to mark onboarding as completed
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (error) {
          console.error('Error updating onboarding completion:', error);
        }
      } catch (error) {
        console.error('Error marking onboarding complete:', error);
      }
    }
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
