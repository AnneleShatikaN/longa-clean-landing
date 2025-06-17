
-- Add onboarding completion tracking and preferred location to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS preferred_location TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed 
ON profiles(onboarding_completed) 
WHERE onboarding_completed = FALSE;

-- Update existing client profiles to show they need onboarding if they're new
UPDATE profiles 
SET onboarding_completed = CASE 
  WHEN role = 'client' AND created_at > NOW() - INTERVAL '3 days' THEN FALSE
  ELSE TRUE
END
WHERE onboarding_completed IS NULL;
