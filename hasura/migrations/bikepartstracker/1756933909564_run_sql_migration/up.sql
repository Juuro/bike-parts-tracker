SET check_function_bodies = false;
CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TABLE public.accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text,
    "userId" uuid NOT NULL
);
CREATE TABLE public.authenticators (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id text NOT NULL,
    credential_public_key bytea NOT NULL,
    counter bigint DEFAULT 0 NOT NULL,
    credential_device_type text,
    credential_backed_up boolean DEFAULT false,
    transports text[],
    created_at timestamp with time zone DEFAULT now(),
    last_used_at timestamp with time zone
);
COMMENT ON TABLE public.authenticators IS 'WebAuthn authenticators (passkeys, security keys, etc.) for users';
CREATE TABLE public.bike (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp(0) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(0) with time zone,
    name text NOT NULL,
    ebike boolean NOT NULL,
    user_id uuid NOT NULL,
    discipline_id uuid NOT NULL,
    category_id uuid NOT NULL,
    strava_bike text,
    images text
);
CREATE TABLE public.category (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL
);
CREATE TABLE public.currency_unit (
    unit text NOT NULL,
    label text NOT NULL,
    symbol text NOT NULL
);
CREATE TABLE public.discipline (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    abbr text NOT NULL
);
CREATE TABLE public.distance_unit (
    unit text NOT NULL,
    label text NOT NULL
);
CREATE TABLE public.installation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    part_id uuid NOT NULL,
    bike_id uuid NOT NULL,
    installed_at timestamp(0) with time zone DEFAULT now() NOT NULL,
    uninstalled_at timestamp(0) with time zone
);
CREATE TABLE public.manufacturer (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp(0) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(0) with time zone,
    name text NOT NULL,
    country text NOT NULL,
    url text
);
CREATE TABLE public.part (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp(0) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(0) with time zone,
    manufacturer_id uuid NOT NULL,
    buy_price double precision,
    sell_price double precision,
    name text NOT NULL,
    weight integer NOT NULL,
    type_id uuid NOT NULL,
    purchase_date timestamp(0) with time zone NOT NULL,
    receipt text,
    secondhand boolean NOT NULL,
    shop_url text,
    part_status_slug text NOT NULL,
    user_id uuid NOT NULL,
    model_year integer NOT NULL
);
CREATE TABLE public.part_status (
    slug text NOT NULL,
    name text NOT NULL,
    available boolean
);
CREATE TABLE public.parts_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp(0) with time zone DEFAULT '2024-08-22 01:55:10.424136+00'::timestamp with time zone NOT NULL,
    updated_at timestamp(0) with time zone,
    name text NOT NULL,
    max_amount integer,
    service_interval integer
);
CREATE TABLE public.provider_type (
    value text NOT NULL
);
CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" uuid NOT NULL,
    expires timestamp with time zone NOT NULL
);
CREATE TABLE public.user_backup_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    code_hash text NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE public.user_backup_codes IS 'Backup codes for account recovery when MFA is enabled';
CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text,
    email text NOT NULL,
    "emailVerified" timestamp with time zone,
    image text,
    currency_unit text,
    created_at timestamp(0) with time zone DEFAULT now() NOT NULL,
    last_seen_at timestamp(0) with time zone,
    updated_at timestamp(0) with time zone,
    strava_user text,
    weight_unit text,
    distance_unit text,
    strava_id character varying(255),
    strava_access_token text,
    strava_refresh_token text,
    strava_expires_at bigint,
    strava_connected_at timestamp with time zone,
    password text,
    mfa_enabled boolean DEFAULT false,
    mfa_secret text,
    backup_codes_generated_at timestamp with time zone,
    webauthn_enabled boolean DEFAULT false,
    webauthn_challenge text
);
COMMENT ON COLUMN public.users.mfa_enabled IS 'Whether the user has enabled multi-factor authentication';
COMMENT ON COLUMN public.users.mfa_secret IS 'TOTP secret for authenticator apps (encrypted)';
COMMENT ON COLUMN public.users.webauthn_enabled IS 'Whether the user has enabled WebAuthn/passkey authentication';
CREATE TABLE public.verification_tokens (
    token text NOT NULL,
    identifier text NOT NULL,
    expires timestamp with time zone NOT NULL
);
CREATE TABLE public.weight_unit (
    unit text NOT NULL,
    label text NOT NULL
);
ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.authenticators
    ADD CONSTRAINT authenticators_credential_id_key UNIQUE (credential_id);
ALTER TABLE ONLY public.authenticators
    ADD CONSTRAINT authenticators_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.authenticators
    ADD CONSTRAINT authenticators_user_id_idx UNIQUE (user_id, credential_id);
ALTER TABLE ONLY public.user_backup_codes
    ADD CONSTRAINT backup_codes_user_id_idx UNIQUE (user_id, code_hash);
ALTER TABLE ONLY public.bike
    ADD CONSTRAINT bike_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.currency_unit
    ADD CONSTRAINT currency_unit_label_key UNIQUE (label);
ALTER TABLE ONLY public.currency_unit
    ADD CONSTRAINT currency_unit_pkey PRIMARY KEY (unit);
ALTER TABLE ONLY public.currency_unit
    ADD CONSTRAINT currency_unit_unit_key UNIQUE (unit);
ALTER TABLE ONLY public.discipline
    ADD CONSTRAINT discipline_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.distance_unit
    ADD CONSTRAINT distance_unit_pkey PRIMARY KEY (unit);
ALTER TABLE ONLY public.distance_unit
    ADD CONSTRAINT distance_unit_unit_key UNIQUE (unit);
ALTER TABLE ONLY public.installation
    ADD CONSTRAINT installation_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.manufacturer
    ADD CONSTRAINT manufacturer_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.part
    ADD CONSTRAINT part_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.parts_type
    ADD CONSTRAINT parts_type_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.provider_type
    ADD CONSTRAINT provider_type_pkey PRIMARY KEY (value);
ALTER TABLE ONLY public.part_status
    ADD CONSTRAINT sell_status_pkey PRIMARY KEY (slug);
ALTER TABLE ONLY public.part_status
    ADD CONSTRAINT sell_status_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY ("sessionToken");
ALTER TABLE ONLY public.user_backup_codes
    ADD CONSTRAINT user_backup_codes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.verification_tokens
    ADD CONSTRAINT verification_tokens_pkey PRIMARY KEY (token);
ALTER TABLE ONLY public.weight_unit
    ADD CONSTRAINT weight_unit_pkey PRIMARY KEY (unit);
ALTER TABLE ONLY public.weight_unit
    ADD CONSTRAINT weight_unit_unit_key UNIQUE (unit);
CREATE INDEX idx_authenticators_credential_id ON public.authenticators USING btree (credential_id);
CREATE INDEX idx_authenticators_user_id ON public.authenticators USING btree (user_id);
CREATE INDEX idx_backup_codes_unused ON public.user_backup_codes USING btree (user_id, used_at) WHERE (used_at IS NULL);
CREATE INDEX idx_backup_codes_user_id ON public.user_backup_codes USING btree (user_id);
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.bike FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.manufacturer FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.part FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.parts_type FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_type_fkey FOREIGN KEY (type) REFERENCES public.provider_type(value) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY public.authenticators
    ADD CONSTRAINT authenticators_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.bike
    ADD CONSTRAINT bike_category_id_foreign FOREIGN KEY (category_id) REFERENCES public.category(id);
ALTER TABLE ONLY public.bike
    ADD CONSTRAINT bike_discipline_id_foreign FOREIGN KEY (discipline_id) REFERENCES public.discipline(id);
ALTER TABLE ONLY public.bike
    ADD CONSTRAINT bike_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.installation
    ADD CONSTRAINT installation_bike_id_foreign FOREIGN KEY (bike_id) REFERENCES public.bike(id);
ALTER TABLE ONLY public.installation
    ADD CONSTRAINT installation_part_id_foreign FOREIGN KEY (part_id) REFERENCES public.part(id);
ALTER TABLE ONLY public.part
    ADD CONSTRAINT part_manufacturer_id_foreign FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturer(id);
ALTER TABLE ONLY public.part
    ADD CONSTRAINT part_part_status_slug_fkey FOREIGN KEY (part_status_slug) REFERENCES public.part_status(slug) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.part
    ADD CONSTRAINT part_type_id_foreign FOREIGN KEY (type_id) REFERENCES public.parts_type(id);
ALTER TABLE ONLY public.part
    ADD CONSTRAINT part_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY public.user_backup_codes
    ADD CONSTRAINT user_backup_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_currency_unit_foreign FOREIGN KEY (currency_unit) REFERENCES public.currency_unit(unit);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_distance_unit_foreign FOREIGN KEY (distance_unit) REFERENCES public.distance_unit(unit);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_weight_unit_foreign FOREIGN KEY (weight_unit) REFERENCES public.weight_unit(unit);
