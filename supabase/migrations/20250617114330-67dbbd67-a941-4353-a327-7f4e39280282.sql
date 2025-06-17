
-- Add provider specialization and availability tables
CREATE TABLE provider_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  expertise_level VARCHAR(20) DEFAULT 'intermediate',
  years_experience INTEGER DEFAULT 0,
  certification_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(provider_id, service_id)
);

-- Add provider availability schedules
CREATE TABLE provider_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(provider_id, day_of_week, start_time, end_time)
);

-- Add provider time off table
CREATE TABLE provider_time_off (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason VARCHAR(255),
  all_day BOOLEAN DEFAULT true,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add booking assignments table to track admin assignments
CREATE TABLE booking_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assignment_reason TEXT,
  auto_assigned BOOLEAN DEFAULT false,
  UNIQUE(booking_id)
);

-- Update bookings table to support assignment workflow
ALTER TABLE bookings ADD COLUMN assignment_status VARCHAR(20) DEFAULT 'unassigned';
ALTER TABLE bookings ADD COLUMN assigned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN assigned_by UUID REFERENCES users(id);

-- Create indexes for performance
CREATE INDEX idx_provider_specializations_provider ON provider_specializations(provider_id);
CREATE INDEX idx_provider_specializations_service ON provider_specializations(service_id);
CREATE INDEX idx_provider_availability_provider ON provider_availability(provider_id);
CREATE INDEX idx_provider_availability_day ON provider_availability(day_of_week);
CREATE INDEX idx_provider_time_off_provider ON provider_time_off(provider_id);
CREATE INDEX idx_provider_time_off_dates ON provider_time_off(start_date, end_date);
CREATE INDEX idx_booking_assignments_booking ON booking_assignments(booking_id);
CREATE INDEX idx_booking_assignments_provider ON booking_assignments(provider_id);
CREATE INDEX idx_bookings_assignment_status ON bookings(assignment_status);

-- Function to check provider availability for a specific time
CREATE OR REPLACE FUNCTION check_provider_availability_at_time(
  p_provider_id UUID,
  p_date DATE,
  p_time TIME,
  p_duration_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  day_of_week INTEGER;
  end_time TIME;
  availability_count INTEGER;
  time_off_count INTEGER;
  booking_conflict_count INTEGER;
BEGIN
  -- Get day of week (0=Sunday)
  day_of_week := EXTRACT(DOW FROM p_date);
  end_time := p_time + (p_duration_minutes || ' minutes')::INTERVAL;
  
  -- Check if provider has availability for this day and time
  SELECT COUNT(*) INTO availability_count
  FROM provider_availability
  WHERE provider_id = p_provider_id
    AND day_of_week = day_of_week
    AND is_available = true
    AND start_time <= p_time
    AND end_time >= end_time;
  
  -- Check if provider has time off
  SELECT COUNT(*) INTO time_off_count
  FROM provider_time_off
  WHERE provider_id = p_provider_id
    AND start_date <= p_date
    AND end_date >= p_date
    AND (
      all_day = true OR
      (start_time <= p_time AND end_time >= end_time)
    );
  
  -- Check for booking conflicts
  SELECT COUNT(*) INTO booking_conflict_count
  FROM bookings
  WHERE provider_id = p_provider_id
    AND booking_date = p_date
    AND status IN ('accepted', 'in_progress')
    AND (
      (booking_time <= p_time AND 
       booking_time + (COALESCE(duration_minutes, 60) || ' minutes')::INTERVAL > p_time) OR
      (p_time <= booking_time AND 
       end_time > booking_time)
    );
  
  RETURN availability_count > 0 AND time_off_count = 0 AND booking_conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to find available providers for a booking
CREATE OR REPLACE FUNCTION find_available_providers_for_booking(
  p_service_id UUID,
  p_booking_date DATE,
  p_booking_time TIME,
  p_duration_minutes INTEGER DEFAULT 60,
  p_location_town VARCHAR DEFAULT 'windhoek'
) RETURNS TABLE(
  provider_id UUID,
  provider_name VARCHAR,
  rating NUMERIC,
  expertise_level VARCHAR,
  years_experience INTEGER,
  availability_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.full_name,
    u.rating,
    COALESCE(ps.expertise_level, 'beginner') as expertise_level,
    COALESCE(ps.years_experience, 0) as years_experience,
    (u.rating * 0.4 + 
     CASE ps.expertise_level 
       WHEN 'expert' THEN 3.0 
       WHEN 'advanced' THEN 2.0 
       WHEN 'intermediate' THEN 1.0 
       ELSE 0.5 
     END * 0.6) as availability_score
  FROM users u
  LEFT JOIN provider_specializations ps ON u.id = ps.provider_id AND ps.service_id = p_service_id
  WHERE u.role = 'provider'
    AND u.is_active = true
    AND u.verification_status = 'verified'
    AND (u.service_coverage_areas IS NULL OR u.service_coverage_areas && ARRAY[p_location_town])
    AND check_provider_availability_at_time(u.id, p_booking_date, p_booking_time, p_duration_minutes)
  ORDER BY availability_score DESC, u.rating DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to assign booking to provider
CREATE OR REPLACE FUNCTION assign_booking_to_provider(
  p_booking_id UUID,
  p_provider_id UUID,
  p_assigned_by UUID,
  p_assignment_reason TEXT DEFAULT NULL,
  p_auto_assigned BOOLEAN DEFAULT false
) RETURNS JSONB AS $$
DECLARE
  booking_record RECORD;
  provider_record RECORD;
  result JSONB;
BEGIN
  -- Get booking details
  SELECT * INTO booking_record FROM bookings WHERE id = p_booking_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Booking not found');
  END IF;
  
  -- Get provider details  
  SELECT * INTO provider_record FROM users WHERE id = p_provider_id AND role = 'provider';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Provider not found');
  END IF;
  
  -- Check if provider is available
  IF NOT check_provider_availability_at_time(
    p_provider_id, 
    booking_record.booking_date, 
    booking_record.booking_time, 
    COALESCE(booking_record.duration_minutes, 60)
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Provider is not available at this time');
  END IF;
  
  -- Update booking
  UPDATE bookings 
  SET 
    provider_id = p_provider_id,
    assignment_status = 'assigned',
    assigned_at = now(),
    assigned_by = p_assigned_by,
    status = 'accepted'
  WHERE id = p_booking_id;
  
  -- Create assignment record
  INSERT INTO booking_assignments (
    booking_id, provider_id, assigned_by, assignment_reason, auto_assigned
  ) VALUES (
    p_booking_id, p_provider_id, p_assigned_by, p_assignment_reason, p_auto_assigned
  );
  
  -- Send notification to provider
  PERFORM send_notification(
    p_provider_id,
    'job_assigned',
    'New Job Assigned',
    'You have been assigned a new job for ' || booking_record.booking_date || ' at ' || booking_record.booking_time,
    jsonb_build_object(
      'booking_id', p_booking_id,
      'assignment_reason', p_assignment_reason,
      'auto_assigned', p_auto_assigned
    ),
    p_booking_id,
    'high'
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Booking assigned successfully',
    'provider_name', provider_record.full_name
  );
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on new tables
ALTER TABLE provider_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for provider_specializations
CREATE POLICY "Providers can view and manage their specializations" ON provider_specializations
  FOR ALL USING (provider_id = auth.uid() OR EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- RLS policies for provider_availability  
CREATE POLICY "Providers can manage their availability" ON provider_availability
  FOR ALL USING (provider_id = auth.uid() OR EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- RLS policies for provider_time_off
CREATE POLICY "Providers can manage their time off" ON provider_time_off
  FOR ALL USING (provider_id = auth.uid() OR EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- RLS policies for booking_assignments
CREATE POLICY "Users can view relevant assignments" ON booking_assignments
  FOR SELECT USING (
    provider_id = auth.uid() OR 
    assigned_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') OR
    EXISTS(SELECT 1 FROM bookings WHERE id = booking_id AND client_id = auth.uid())
  );

CREATE POLICY "Admins can manage assignments" ON booking_assignments
  FOR ALL USING (EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
