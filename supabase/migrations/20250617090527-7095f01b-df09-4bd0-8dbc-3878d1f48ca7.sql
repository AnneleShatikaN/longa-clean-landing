
-- Add coverage areas to providers
ALTER TABLE users 
ADD COLUMN service_coverage_areas text[] DEFAULT ARRAY['windhoek']::text[];

-- Add location filtering to services table
ALTER TABLE services 
ADD COLUMN coverage_areas text[] DEFAULT ARRAY['windhoek', 'walvis_bay', 'swakopmund']::text[];

-- Create a function to get services available in a specific location
CREATE OR REPLACE FUNCTION get_services_by_location(location_filter text DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  name character varying,
  description text,
  service_type character varying,
  client_price numeric,
  duration_minutes integer,
  tags text[],
  coverage_areas text[],
  provider_count bigint
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.description,
    s.service_type,
    s.client_price,
    s.duration_minutes,
    s.tags,
    s.coverage_areas,
    COUNT(u.id) as provider_count
  FROM services s
  LEFT JOIN users u ON u.role = 'provider' 
    AND u.is_active = true 
    AND (location_filter IS NULL OR u.service_coverage_areas && ARRAY[location_filter])
  WHERE s.is_active = true
    AND (location_filter IS NULL OR s.coverage_areas && ARRAY[location_filter])
  GROUP BY s.id, s.name, s.description, s.service_type, s.client_price, s.duration_minutes, s.tags, s.coverage_areas
  HAVING COUNT(u.id) > 0 OR location_filter IS NULL
  ORDER BY provider_count DESC, s.name;
END;
$$;

-- Create a function to get providers available in a specific location
CREATE OR REPLACE FUNCTION get_providers_by_location(
  location_filter text DEFAULT NULL,
  service_id_filter uuid DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  full_name character varying,
  rating numeric,
  total_jobs integer,
  current_work_location character varying,
  service_coverage_areas text[]
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.full_name,
    u.rating,
    u.total_jobs,
    u.current_work_location,
    u.service_coverage_areas
  FROM users u
  WHERE u.role = 'provider'
    AND u.is_active = true
    AND (location_filter IS NULL OR u.service_coverage_areas && ARRAY[location_filter])
    AND (service_id_filter IS NULL OR EXISTS(
      SELECT 1 FROM services s 
      WHERE s.id = service_id_filter 
      AND s.coverage_areas && u.service_coverage_areas
    ))
  ORDER BY u.rating DESC, u.total_jobs DESC;
END;
$$;

-- Update existing providers to have default coverage areas
UPDATE users 
SET service_coverage_areas = ARRAY['windhoek'] 
WHERE role = 'provider' AND service_coverage_areas IS NULL;

-- Update existing services to have default coverage areas  
UPDATE services 
SET coverage_areas = ARRAY['windhoek', 'walvis_bay', 'swakopmund'] 
WHERE coverage_areas IS NULL;
