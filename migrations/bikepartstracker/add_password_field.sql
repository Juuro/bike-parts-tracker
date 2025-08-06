-- Add password field to users table for email/password authentication
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Add index for email lookups (for performance)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
