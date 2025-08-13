-- Add MFA and WebAuthn support tables

-- Add MFA fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS mfa_secret TEXT,
ADD COLUMN IF NOT EXISTS backup_codes_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS webauthn_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS webauthn_challenge TEXT;

-- Create table for WebAuthn authenticators
CREATE TABLE IF NOT EXISTS public.authenticators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    credential_id TEXT NOT NULL UNIQUE,
    credential_public_key BYTEA NOT NULL,
    counter BIGINT NOT NULL DEFAULT 0,
    credential_device_type TEXT,
    credential_backed_up BOOLEAN DEFAULT FALSE,
    transports TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Add index for faster lookups
    CONSTRAINT authenticators_user_id_idx UNIQUE (user_id, credential_id)
);

-- Create table for backup codes
CREATE TABLE IF NOT EXISTS public.user_backup_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Add index for faster lookups
    CONSTRAINT backup_codes_user_id_idx UNIQUE (user_id, code_hash)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_authenticators_user_id ON public.authenticators(user_id);
CREATE INDEX IF NOT EXISTS idx_authenticators_credential_id ON public.authenticators(credential_id);
CREATE INDEX IF NOT EXISTS idx_backup_codes_user_id ON public.user_backup_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_backup_codes_unused ON public.user_backup_codes(user_id, used_at) WHERE used_at IS NULL;

-- Add comments for documentation
COMMENT ON TABLE public.authenticators IS 'WebAuthn authenticators (passkeys, security keys, etc.) for users';
COMMENT ON TABLE public.user_backup_codes IS 'Backup codes for account recovery when MFA is enabled';
COMMENT ON COLUMN public.users.mfa_enabled IS 'Whether the user has enabled multi-factor authentication';
COMMENT ON COLUMN public.users.mfa_secret IS 'TOTP secret for authenticator apps (encrypted)';
COMMENT ON COLUMN public.users.webauthn_enabled IS 'Whether the user has enabled WebAuthn/passkey authentication';
