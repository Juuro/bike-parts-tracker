-- Add Strava integration fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS strava_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS strava_access_token TEXT,
ADD COLUMN IF NOT EXISTS strava_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS strava_expires_at BIGINT,
ADD COLUMN IF NOT EXISTS strava_connected_at TIMESTAMP WITH TIME ZONE;
