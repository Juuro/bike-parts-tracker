--
-- PostgreSQL database dump
--


-- Dumped from database version 15.13 (68b1d38)
-- Dumped by pg_dump version 15.14 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: sebastianengel
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO sebastianengel;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: sebastianengel
--

COMMENT ON SCHEMA public IS '';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: sebastianengel
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO sebastianengel;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: sebastianengel
--

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


ALTER TABLE public.accounts OWNER TO sebastianengel;

--
-- Name: authenticators; Type: TABLE; Schema: public; Owner: sebastianengel
--

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


ALTER TABLE public.authenticators OWNER TO sebastianengel;

--
-- Name: TABLE authenticators; Type: COMMENT; Schema: public; Owner: sebastianengel
--

COMMENT ON TABLE public.authenticators IS 'WebAuthn authenticators (passkeys, security keys, etc.) for users';


--
-- Name: bike; Type: TABLE; Schema: public; Owner: sebastianengel
--

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


ALTER TABLE public.bike OWNER TO sebastianengel;

--
-- Name: category; Type: TABLE; Schema: public; Owner: sebastianengel
--

CREATE TABLE public.category (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.category OWNER TO sebastianengel;

--
-- Name: currency_unit; Type: TABLE; Schema: public; Owner: sebastianengel
--

CREATE TABLE public.currency_unit (
    unit text NOT NULL,
    label text NOT NULL,
    symbol text NOT NULL
);


ALTER TABLE public.currency_unit OWNER TO sebastianengel;

--
-- Name: discipline; Type: TABLE; Schema: public; Owner: sebastianengel
--

CREATE TABLE public.discipline (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    abbr text NOT NULL
);


ALTER TABLE public.discipline OWNER TO sebastianengel;

--
-- Name: distance_unit; Type: TABLE; Schema: public; Owner: sebastianengel
--

CREATE TABLE public.distance_unit (
    unit text NOT NULL,
    label text NOT NULL
);


ALTER TABLE public.distance_unit OWNER TO sebastianengel;

--
-- Name: installation; Type: TABLE; Schema: public; Owner: sebastianengel
--

CREATE TABLE public.installation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    part_id uuid NOT NULL,
    bike_id uuid NOT NULL,
    installed_at timestamp(0) with time zone DEFAULT now() NOT NULL,
    uninstalled_at timestamp(0) with time zone
);


ALTER TABLE public.installation OWNER TO sebastianengel;

--
-- Name: manufacturer; Type: TABLE; Schema: public; Owner: sebastianengel
--

CREATE TABLE public.manufacturer (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp(0) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(0) with time zone,
    name text NOT NULL,
    country text NOT NULL,
    url text
);


ALTER TABLE public.manufacturer OWNER TO sebastianengel;

--
-- Name: part; Type: TABLE; Schema: public; Owner: sebastianengel
--

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


ALTER TABLE public.part OWNER TO sebastianengel;

--
-- Name: part_status; Type: TABLE; Schema: public; Owner: sebastianengel
--

CREATE TABLE public.part_status (
    slug text NOT NULL,
    name text NOT NULL,
    available boolean
);


ALTER TABLE public.part_status OWNER TO sebastianengel;

--
-- Name: parts_type; Type: TABLE; Schema: public; Owner: sebastianengel
--

CREATE TABLE public.parts_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp(0) with time zone DEFAULT '2024-08-22 01:55:10.424136+00'::timestamp with time zone NOT NULL,
    updated_at timestamp(0) with time zone,
    name text NOT NULL,
    max_amount integer,
    service_interval integer
);


ALTER TABLE public.parts_type OWNER TO sebastianengel;

--
-- Name: provider_type; Type: TABLE; Schema: public; Owner: sebastianengel
--

CREATE TABLE public.provider_type (
    value text NOT NULL
);


ALTER TABLE public.provider_type OWNER TO sebastianengel;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: sebastianengel
--

CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" uuid NOT NULL,
    expires timestamp with time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO sebastianengel;

--
-- Name: user_backup_codes; Type: TABLE; Schema: public; Owner: sebastianengel
--

CREATE TABLE public.user_backup_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    code_hash text NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.user_backup_codes OWNER TO sebastianengel;

--
-- Name: TABLE user_backup_codes; Type: COMMENT; Schema: public; Owner: sebastianengel
--

COMMENT ON TABLE public.user_backup_codes IS 'Backup codes for account recovery when MFA is enabled';


--
-- Name: users; Type: TABLE; Schema: public; Owner: sebastianengel
--

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


ALTER TABLE public.users OWNER TO sebastianengel;

--
-- Name: COLUMN users.mfa_enabled; Type: COMMENT; Schema: public; Owner: sebastianengel
--

COMMENT ON COLUMN public.users.mfa_enabled IS 'Whether the user has enabled multi-factor authentication';


--
-- Name: COLUMN users.mfa_secret; Type: COMMENT; Schema: public; Owner: sebastianengel
--

COMMENT ON COLUMN public.users.mfa_secret IS 'TOTP secret for authenticator apps (encrypted)';


--
-- Name: COLUMN users.webauthn_enabled; Type: COMMENT; Schema: public; Owner: sebastianengel
--

COMMENT ON COLUMN public.users.webauthn_enabled IS 'Whether the user has enabled WebAuthn/passkey authentication';


--
-- Name: verification_tokens; Type: TABLE; Schema: public; Owner: sebastianengel
--

CREATE TABLE public.verification_tokens (
    token text NOT NULL,
    identifier text NOT NULL,
    expires timestamp with time zone NOT NULL
);


ALTER TABLE public.verification_tokens OWNER TO sebastianengel;

--
-- Name: weight_unit; Type: TABLE; Schema: public; Owner: sebastianengel
--

CREATE TABLE public.weight_unit (
    unit text NOT NULL,
    label text NOT NULL
);


ALTER TABLE public.weight_unit OWNER TO sebastianengel;

--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: sebastianengel
--

COPY public.accounts (id, type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state, "userId") FROM stdin;
d0cd2616-8a29-49c7-8b36-65a03bd17742	oidc	google	111737190163692064375		ya29.a0AcM612zqbp2F2HgBQG0ZLoSIGgcUoYR6N2NsoBh3_SvxZiP8Mp8UK7EQwQg6Y8ZiQBKBR3bJrXZOrKKvZW3Oa-TQ0e2pc9p5g9PEQkUql2Oi2Xdna9mgnqghUXfFGko-y7d-R41X6G8fY-p3uyfwR9cfo8Pp_VNS5YcaCgYKAb8SARESFQHGX2MiIyVWYv4ATCiy0R6luo9sVQ0170	1724291942	bearer	https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid	eyJhbGciOiJSUzI1NiIsImtpZCI6ImQyZDQ0NGNmOGM1ZTNhZTgzODZkNjZhMTNhMzE2OTc2YWEzNjk5OTEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxMDIxNTc4NzE0MDYzLWw1OWpibDI4MHNjdHFsMXM2djdpZm9kOXFuZDRtc2NhLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMTAyMTU3ODcxNDA2My1sNTlqYmwyODBzY3RxbDFzNnY3aWZvZDlxbmQ0bXNjYS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExMTczNzE5MDE2MzY5MjA2NDM3NSIsImVtYWlsIjoic2Fzc2VsbGFuQGdvb2dsZW1haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJKbmtrakhiOEJSWlVEcFBPa0luQVFBIiwibmFtZSI6IlNlYmFzdGlhbiBFbmdlbCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLMTFweWlUWXVfd1ZlcTdDNnhxZjkwNmV1Nk5hRXM5eGQ2cVEzMHdETTQ0a0tBNEdmVT1zOTYtYyIsImdpdmVuX25hbWUiOiJTZWJhc3RpYW4iLCJmYW1pbHlfbmFtZSI6IkVuZ2VsIiwiaWF0IjoxNzI0Mjg4MzQzLCJleHAiOjE3MjQyOTE5NDN9.iZ2V7PP5m_0e1NOjJoctje3k8SNAbqWdydhLDGDtLXYZMWLhEmFzZgTXuSHpjS08c0XKGDiemu1Hpj-4kD57aN-mrtyD4SRRYhkpMM4OeHy9VczMyAeWO9hCftOTnWVOJ3AAIgP60nvnTpIU6-DgwUBYs10ELRintAVo6Qv3c0WXlsxqiUAH6Or-cYoz3pQgStCFIK8TrBOw2Sa5--walDIZuILroc7A3R8M_Coc51TrK_of22XwBJOn3nLPgr7u6PZplAPn-qQr8Sxgn82fhgJw9NzPbu49mXzKk89_4x8vS27BM6v_TmU1JCHu0inosT5Vl69o6uDqQICUim6-EQ	\N	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445
11ac432e-f051-4e28-a38d-97fd598f5023	oauth	webauthn	pBh9JEKyYTJUqrNkgh/zW9NheHw=	\N	\N	\N	\N	\N	\N	\N	3ddcfc2c-7838-41af-bcfa-729388f8d4f1
6cdc20c6-fec2-4b4d-9e53-a7e39d2b38b7	oauth	webauthn	xBhAXdQoR3pi8q9OgHZtHdA8QGI=	\N	\N	\N	\N	\N	\N	\N	3ddcfc2c-7838-41af-bcfa-729388f8d4f1
6a489c80-77b2-486e-bc54-657b8807615f	oauth	webauthn	G0jjMWDy2DYPkp25wopyJLUWO8g=	\N	\N	\N	\N	\N	\N	\N	3ddcfc2c-7838-41af-bcfa-729388f8d4f1
2b6e0d67-62f6-4323-9103-906bba421ee8	oauth	webauthn	T62Y7Ui4jEAOUgru0uQZmm2ykWU=	\N	\N	\N	\N	\N	\N	\N	3ddcfc2c-7838-41af-bcfa-729388f8d4f1
86667229-4334-43da-be97-59865e0ec040	oauth	webauthn	Et0MQnrXD2kP6DcCS+YaH6j50qw=	\N	\N	\N	\N	\N	\N	\N	3ddcfc2c-7838-41af-bcfa-729388f8d4f1
476b3b9c-6219-4f93-91d1-cc9ca543e1af	oauth	webauthn	Et0MQnrXD2kP6DcCS+YaH6j50qw=	\N	\N	\N	\N	\N	\N	\N	3ddcfc2c-7838-41af-bcfa-729388f8d4f1
c1512cc4-54e4-4297-a14e-26d5684a8428	oauth	webauthn	Et0MQnrXD2kP6DcCS+YaH6j50qw=	\N	\N	\N	\N	\N	\N	\N	3ddcfc2c-7838-41af-bcfa-729388f8d4f1
\.


--
-- Data for Name: authenticators; Type: TABLE DATA; Schema: public; Owner: sebastianengel
--

COPY public.authenticators (id, user_id, credential_id, credential_public_key, counter, credential_device_type, credential_backed_up, transports, created_at, last_used_at) FROM stdin;
4cd46ee3-cc71-40ef-bd7c-5b4ee58552c7	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	Et0MQnrXD2kP6DcCS+YaH6j50qw=	\\x705145434179596741534659494d424571796b4f546b55654459702b72374f6363713377745a6f54654c6976735376306b616c4f6543504a496c6767544249514e58596e5132534e52712b794275752f557555737a4f6e486d506d736768376c7669336d6a4d733d	0	multiDevice	t	{internal,hybrid}	2025-08-12 08:15:30.799838+00	\N
\.


--
-- Data for Name: bike; Type: TABLE DATA; Schema: public; Owner: sebastianengel
--

COPY public.bike (id, created_at, updated_at, name, ebike, user_id, discipline_id, category_id, strava_bike, images) FROM stdin;
d41c2008-b9fc-4890-a700-56a3441e9784	2024-08-22 01:55:10+00	\N	Blackberry	f	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	61bb661a-a8f0-4341-b5cc-46509799888a	8a0c1113-c227-4852-a88d-584af9520d11	8450877	\N
88f0d8a4-5345-4811-b45a-79beae282c5e	2024-08-22 01:55:10+00	\N	Raspberry	f	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	4bc339bb-d956-4b41-a4c2-7078b081dd5e	5883ef42-cea5-4458-8a9a-a848b62e0633	4782580	\N
bad308ea-23be-49ed-8422-827096e35b30	2024-08-22 01:55:10+00	\N	Cube LTD CC 2008	f	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	ed9b0a53-e75f-417c-b36c-291f92a0682f	5883ef42-cea5-4458-8a9a-a848b62e0633	1149475	\N
a1be4d5e-c815-4495-9d2b-7307441aaf20	2024-08-22 01:55:10+00	2025-08-05 20:02:56+00	Arcade	f	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	4d9bf7f4-6fed-46ca-84bb-dd72930607a2	8a0c1113-c227-4852-a88d-584af9520d11	4993957	https://res.cloudinary.com/juuro-dev/image/upload/v1739234403/bike-parts-tracker/z12rbdho7b2c46nwdjnr.jpg
12072258-daef-4354-bce8-7adb7e37c8d5	2024-08-22 01:55:10+00	2025-08-14 17:16:25+00	MOG	f	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	652df182-a2ed-4db4-a5e4-4448ed25a5cd	fba3c101-34ab-4653-9d58-e4591d8f63e2	12547465	https://res.cloudinary.com/juuro-dev/image/upload/v1755191783/bike-parts-tracker/oojrphllatlwseef7vu8.png,https://res.cloudinary.com/juuro-dev/image/upload/v1749389785/bike-parts-tracker/baabftpiddrccrr7mg4w.jpg,https://res.cloudinary.com/juuro-dev/image/upload/v1749384711/bike-parts-tracker/oq4twk2bktuv5163ilxp.jpg,https://res.cloudinary.com/juuro-dev/image/upload/v1749384304/bike-parts-tracker/ijqj5z29rz56rokdmwuc.png,https://res.cloudinary.com/juuro-dev/image/upload/v1749382352/bike-parts-tracker/elvgzzu0tesxxcpslm19.jpg
\.


--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: sebastianengel
--

COPY public.category (id, name) FROM stdin;
8a0c1113-c227-4852-a88d-584af9520d11	Mountainbike
fba3c101-34ab-4653-9d58-e4591d8f63e2	Gravelbike
5883ef42-cea5-4458-8a9a-a848b62e0633	Stadtrad
b759e6e1-06c3-41d0-9cec-88fcf3e0b57f	Rennrad
ad4f0138-7cb3-494f-82e6-cea997195061	Trecking
2fe7300e-c3e8-4cf1-8e68-ec8f3d7a4e6c	Touring
\.


--
-- Data for Name: currency_unit; Type: TABLE DATA; Schema: public; Owner: sebastianengel
--

COPY public.currency_unit (unit, label, symbol) FROM stdin;
USD	US Dollar	$
EUR	Euro	€
GBP	British Pound	£
CHF	Swiss Franc	CHF
CAD	Canadian Dollar	C$
AUD	Australian Dollar	A$
JPY	Japanese Yen	¥
\.


--
-- Data for Name: discipline; Type: TABLE DATA; Schema: public; Owner: sebastianengel
--

COPY public.discipline (id, name, abbr) FROM stdin;
4d9bf7f4-6fed-46ca-84bb-dd72930607a2	Cross Country Olympic	XCO
ed9b0a53-e75f-417c-b36c-291f92a0682f	Cross Country Marathon	XCM
b27b8030-01b4-440e-bacc-1ad6e0e9bf39	Downhill	DHI
652df182-a2ed-4db4-a5e4-4448ed25a5cd	Gravel	GRA
61bb661a-a8f0-4341-b5cc-46509799888a	Enduro	EDR
8106e03a-654a-4016-b1c7-84833ad9e891	Cyclocross	CX
4bc339bb-d956-4b41-a4c2-7078b081dd5e	Road	R
31dd52fb-e742-4e69-a860-ed46310ac621	Track	T
\.


--
-- Data for Name: distance_unit; Type: TABLE DATA; Schema: public; Owner: sebastianengel
--

COPY public.distance_unit (unit, label) FROM stdin;
km	Kilometers
mi	Miles
\.


--
-- Data for Name: installation; Type: TABLE DATA; Schema: public; Owner: sebastianengel
--

COPY public.installation (id, part_id, bike_id, installed_at, uninstalled_at) FROM stdin;
7be2b9c5-5f23-4cd4-9d7c-7e2237a107f4	1a76ae31-d044-40e3-8990-fd63185411a7	12072258-daef-4354-bce8-7adb7e37c8d5	2024-09-22 17:10:48+00	\N
2ec1cfe2-cba8-4ded-9bf4-6333575083d0	98016677-6997-401b-9c03-a3fd7485280e	12072258-daef-4354-bce8-7adb7e37c8d5	2024-09-22 17:11:23+00	\N
333ded3e-0ee8-4f8b-9098-5d465c8a6eab	7bad89c7-2a19-4d47-8da3-dd4dfbfac461	12072258-daef-4354-bce8-7adb7e37c8d5	2024-09-22 17:23:48+00	2024-09-22 17:51:29+00
14de7561-49a9-416e-8f00-504126407eb1	d82af1fa-e0db-4150-9f48-00c989cb98b2	12072258-daef-4354-bce8-7adb7e37c8d5	2024-09-22 17:11:13+00	2024-09-22 17:52:14+00
030cdaa1-3b4d-4f77-a548-d002d78c7bb5	3e810b7c-88a1-4dd6-826a-93a94db40ca3	a1be4d5e-c815-4495-9d2b-7307441aaf20	2024-09-22 17:13:06+00	2024-09-22 18:08:46+00
f216c8ed-114a-4182-9c1e-dbf93152a176	7bad89c7-2a19-4d47-8da3-dd4dfbfac461	12072258-daef-4354-bce8-7adb7e37c8d5	2024-09-22 18:28:12+00	\N
d9e775a6-482c-4e93-974a-99b0faf22fbc	05dc415c-8311-4e2e-b286-4be20d510637	a1be4d5e-c815-4495-9d2b-7307441aaf20	2024-09-22 18:28:16+00	2024-09-22 18:28:19+00
79328898-2308-4596-bce3-a7d08dce9950	46e23f5c-cd4f-4fd8-8dad-55cbfee6f120	a1be4d5e-c815-4495-9d2b-7307441aaf20	2024-09-22 16:47:36+00	2024-09-22 23:29:14+00
41212fc3-454c-4fe6-953e-13af4a291764	05dc415c-8311-4e2e-b286-4be20d510637	a1be4d5e-c815-4495-9d2b-7307441aaf20	2024-09-22 23:41:32+00	2024-09-22 23:42:41+00
b11edae4-79b4-430c-bf07-549abbc71af8	05dc415c-8311-4e2e-b286-4be20d510637	12072258-daef-4354-bce8-7adb7e37c8d5	2024-09-23 00:16:51+00	2024-09-23 00:29:09+00
04c5d695-4504-4a40-8bcf-dc9b3b69052f	05dc415c-8311-4e2e-b286-4be20d510637	a1be4d5e-c815-4495-9d2b-7307441aaf20	2024-09-23 00:29:10+00	2024-09-28 21:56:03+00
e8ba3453-d86b-4f53-942e-b9529993d486	05dc415c-8311-4e2e-b286-4be20d510637	a1be4d5e-c815-4495-9d2b-7307441aaf20	2024-09-28 21:56:10+00	2024-09-28 21:56:22+00
33098c28-9d4f-49ab-a200-2b005bc0f806	0c4dbd10-fe54-4951-86f9-c90fec2cf507	12072258-daef-4354-bce8-7adb7e37c8d5	2024-09-12 00:00:00+00	\N
b8699b9b-5ab7-4103-927a-d6977796e5bc	eb321b54-0123-404f-8909-a518ac0e1477	a1be4d5e-c815-4495-9d2b-7307441aaf20	2024-09-22 17:04:53+00	2024-10-26 13:40:00+00
4bfa229d-b75f-4333-9d1a-161d72288c32	05dc415c-8311-4e2e-b286-4be20d510637	a1be4d5e-c815-4495-9d2b-7307441aaf20	2024-09-28 21:56:31+00	2024-11-02 22:45:26+00
de68db5a-64cf-48c2-9a58-e672b71996e8	46e23f5c-cd4f-4fd8-8dad-55cbfee6f120	a1be4d5e-c815-4495-9d2b-7307441aaf20	2024-09-22 23:29:31+00	2024-11-02 22:45:27+00
5335df20-377f-46ef-a36a-3a6c13db6031	a2f3b294-bdb6-414d-a616-64fccc812aa3	a1be4d5e-c815-4495-9d2b-7307441aaf20	2024-09-22 17:10:40+00	2024-11-02 22:45:36+00
03dfa249-0da6-4d1d-a943-cf81021b0ffe	90429158-73e4-4aed-a7e3-79107729ef45	a1be4d5e-c815-4495-9d2b-7307441aaf20	2024-09-22 17:12:49+00	2024-11-02 22:46:41+00
0e0f3445-ea71-45ed-b051-b23697469276	5410e694-5fd6-46d1-8e11-0b96adb60287	12072258-daef-4354-bce8-7adb7e37c8d5	2024-10-11 00:00:00+00	2024-11-02 22:52:02+00
9b03c812-aeec-4b51-a0a9-6e0a818491fc	d82af1fa-e0db-4150-9f48-00c989cb98b2	12072258-daef-4354-bce8-7adb7e37c8d5	2024-09-22 18:28:07+00	2024-11-03 01:01:10+00
f1cf4652-451f-4783-a3f0-aa2ac0e71923	0f2a6bf0-ef43-444e-974c-cf0fe9b8ceb7	12072258-daef-4354-bce8-7adb7e37c8d5	2024-09-03 00:00:00+00	2024-11-03 01:04:17+00
87b1ff7b-46ce-4faa-b8e7-91e0f79b1866	3e810b7c-88a1-4dd6-826a-93a94db40ca3	a1be4d5e-c815-4495-9d2b-7307441aaf20	2024-09-22 18:22:54+00	2025-01-18 16:48:16+00
9b9441e0-be34-4cf1-a8a6-71444c28dfd6	63c85edf-6641-4693-8540-aaa007e90b32	12072258-daef-4354-bce8-7adb7e37c8d5	2024-10-11 00:00:00+00	2025-04-05 23:12:39+00
205c90c8-d921-46db-8ebd-1382479d331e	a2f3b294-bdb6-414d-a616-64fccc812aa3	a1be4d5e-c815-4495-9d2b-7307441aaf20	2024-11-02 22:48:21+00	2025-07-26 12:44:43+00
f1b4e257-bc0d-4e16-96ed-12f4186a316e	90429158-73e4-4aed-a7e3-79107729ef45	a1be4d5e-c815-4495-9d2b-7307441aaf20	2024-11-02 22:48:18+00	2025-07-26 12:44:57+00
2c7e0417-619a-4a1c-818b-ed0ba720e0c8	90429158-73e4-4aed-a7e3-79107729ef45	a1be4d5e-c815-4495-9d2b-7307441aaf20	2025-07-26 12:45:14+00	\N
4c5730ee-1812-4203-94fd-2412a932ed47	a2f3b294-bdb6-414d-a616-64fccc812aa3	a1be4d5e-c815-4495-9d2b-7307441aaf20	2025-07-26 12:45:55+00	\N
1b8bd2ac-6d96-47ad-8622-9daac9362242	0f2a6bf0-ef43-444e-974c-cf0fe9b8ceb7	12072258-daef-4354-bce8-7adb7e37c8d5	2025-07-26 13:04:11+00	\N
1196f387-98dd-456a-9b52-114f1482b9b4	63c85edf-6641-4693-8540-aaa007e90b32	12072258-daef-4354-bce8-7adb7e37c8d5	2025-07-26 13:05:17+00	2025-07-26 13:06:04+00
8055c1e8-f269-44c8-9571-d62ae9bf887a	63c85edf-6641-4693-8540-aaa007e90b32	12072258-daef-4354-bce8-7adb7e37c8d5	2025-07-26 13:05:17+00	2025-07-26 13:06:05+00
b1356085-3043-4afd-bf3b-0af1f60af6ae	63c85edf-6641-4693-8540-aaa007e90b32	12072258-daef-4354-bce8-7adb7e37c8d5	2025-07-26 13:05:16+00	2025-07-26 13:06:27+00
b36aeb46-bd28-457c-bd40-da1c0e555519	0f2a6bf0-ef43-444e-974c-cf0fe9b8ceb7	12072258-daef-4354-bce8-7adb7e37c8d5	2025-07-26 13:04:12+00	2025-07-26 13:17:15+00
b9e582bd-954a-4f79-ae57-521c093b7447	d82af1fa-e0db-4150-9f48-00c989cb98b2	12072258-daef-4354-bce8-7adb7e37c8d5	2025-04-05 23:11:48+00	2025-07-26 13:17:23+00
cc47f749-9d03-44a9-be86-5184d4b76cec	d82af1fa-e0db-4150-9f48-00c989cb98b2	bad308ea-23be-49ed-8422-827096e35b30	2025-07-26 13:17:33+00	2025-07-26 13:17:54+00
a1660fa9-2bce-4aa5-948a-079916bd610f	d82af1fa-e0db-4150-9f48-00c989cb98b2	bad308ea-23be-49ed-8422-827096e35b30	2025-07-26 13:17:58+00	2025-07-26 13:18:08+00
b0c3e29a-dacb-4552-b3da-e91356ac45bc	d82af1fa-e0db-4150-9f48-00c989cb98b2	bad308ea-23be-49ed-8422-827096e35b30	2025-07-26 13:18:27+00	2025-07-26 13:18:32+00
31ea748c-6909-40a7-86b9-0e100b093a6f	d82af1fa-e0db-4150-9f48-00c989cb98b2	bad308ea-23be-49ed-8422-827096e35b30	2025-07-26 13:19:47+00	2025-07-26 13:20:29+00
f9c07b73-928f-4108-bf9a-c5aebc1251a3	d82af1fa-e0db-4150-9f48-00c989cb98b2	bad308ea-23be-49ed-8422-827096e35b30	2025-07-26 13:20:38+00	2025-07-26 13:24:43+00
da8d131c-cbc7-4ff7-b3f5-ed9d11eac458	d82af1fa-e0db-4150-9f48-00c989cb98b2	12072258-daef-4354-bce8-7adb7e37c8d5	2025-07-26 13:24:44+00	\N
9e1807f6-1996-4ba1-a004-fd3fd6c3c745	63c85edf-6641-4693-8540-aaa007e90b32	12072258-daef-4354-bce8-7adb7e37c8d5	2025-07-26 13:05:16+00	2025-07-26 13:24:52+00
a0aa597c-9f61-494f-b144-53ed261d9a27	ccb1a1cc-96c5-44f6-89ac-c2ae3c004454	12072258-daef-4354-bce8-7adb7e37c8d5	2024-09-22 17:10:55+00	2025-07-26 13:24:57+00
1a180fd3-527e-488a-8ae3-99e1fdea9bff	05dc415c-8311-4e2e-b286-4be20d510637	a1be4d5e-c815-4495-9d2b-7307441aaf20	2025-08-03 16:00:23+00	\N
\.


--
-- Data for Name: manufacturer; Type: TABLE DATA; Schema: public; Owner: sebastianengel
--

COPY public.manufacturer (id, created_at, updated_at, name, country, url) FROM stdin;
2fe8ed6c-15d1-4a5d-a08b-7e8bf075338f	2024-08-22 01:55:10+00	\N	Arc8	SUI	https://www.arc8bicycles.ch
e8fd544f-1434-4ab3-b142-97c2198b8c4a	2024-08-22 01:55:10+00	\N	Enve	USA	http://enve.com
8bf3e413-e135-4ed4-bc45-6da8b01da6b0	2024-08-22 01:55:10+00	\N	Shimano	JPN	https://www.shimano.com/
53ed3d6c-4c21-4c9c-a052-0fab929a1376	2024-09-29 00:43:13+00	\N	RockShox	USA	https://www.sram.com/de/rockshox
2a249327-c62e-4e13-8343-f99e72cb4b6a	2024-09-29 01:20:51+00	2024-09-29 01:21:33+00	SRAM	USA	https://www.sram.com
722b7895-3bb0-4230-8ba0-b68d616a32d3	2024-09-29 01:27:33+00	\N	Trickstuff	GER	https://www.trickstuff.com/de
74df9378-6d04-4b69-80c0-2ef539680427	2024-09-29 01:30:38+00	\N	Darimo	ESP	http://darimo.eu
de16d6b4-8b5c-4660-9e21-65be8882ccaa	2024-09-29 01:37:45+00	\N	Tune	GER	https://www.tune.de
b0f1fa29-1783-4f4b-a6f4-c8b5a4f5ecf8	2024-09-29 01:45:57+00	\N	ESI Grips	USA	https://esigrips.com
58cf81f5-b6dc-43ed-96d8-03d8a3e005dc	2024-09-29 02:54:49+00	\N	DT Swiss	SUI	https://www.dtswiss.com
dcf9c57f-04b6-40bf-8b02-29bdd03cb4a7	2024-09-29 03:05:09+00	\N	Nextie	USA	https://www.nextie.com
7cf7a1c0-2cd2-4015-99ea-c26f09ca576c	2024-09-29 03:08:13+00	\N	Muc-Off	GBR	https://eu.muc-off.com/de
fa59b40b-3115-4819-9c2a-b2b0d81643e2	2024-09-29 03:16:19+00	\N	Vittoria	ITA	https://vittoria.com
ffa159bf-5ddd-44b8-b94e-a01f5f4558f5	2024-09-29 03:19:27+00	\N	Schwalbe	GER	https://www.schwalbe.com/en/
e032f4a6-bf49-414d-b406-53ad84daa88d	2024-09-29 03:27:09+00	\N	Campagnolo	ITA	https://www.campagnolo.com/de-de/
3c8e5c9f-67bf-4fc8-96e5-6731c7771344	2024-10-26 13:21:01+00	\N	Dingensdabummens	ItalyyyyBiatch	http://moep.lol.de
c5a96472-aa8a-45d6-a994-fe2218519e15	2024-10-26 13:23:02+00	\N	Schubidub	Usbekistan	https://didel.ub
f6dbad80-261a-49bb-b84e-5ac6dbbbbe8b	2025-08-19 19:20:08+00	\N	Furzbusen	Schörmenie	
5c35ba28-b0fb-48ea-806c-162310bbe569	2025-08-19 19:41:31+00	\N	HeribertDingensDübler	Schnurzelien	\N
3b4f8784-fa4e-4458-b5c0-03d2c6573ac2	2025-08-19 19:48:08+00	\N	Dubsidubs	Hihi	\N
f14f09a3-64b5-468c-a3f4-920f9fbca386	2025-08-19 20:23:43+00	\N	Schnucksler	Schalurien	\N
\.


--
-- Data for Name: part; Type: TABLE DATA; Schema: public; Owner: sebastianengel
--

COPY public.part (id, created_at, updated_at, manufacturer_id, buy_price, sell_price, name, weight, type_id, purchase_date, receipt, secondhand, shop_url, part_status_slug, user_id, model_year) FROM stdin;
05dc415c-8311-4e2e-b286-4be20d510637	2024-08-22 01:55:10+00	2025-08-07 17:32:50+00	8bf3e413-e135-4ed4-bc45-6da8b01da6b0	3	\N	XTR	5	33025e21-48d2-4766-a1e4-2ab713bfebc4	2024-09-04 00:00:00+00	\N	f		planned_for_sale	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	1987
ccb1a1cc-96c5-44f6-89ac-c2ae3c004454	2024-08-22 01:55:10+00	2024-09-27 21:04:52+00	e8fd544f-1434-4ab3-b142-97c2198b8c4a	1500	\N	3.4	700	704ffd21-e322-4d08-9ee8-9a4ee9476d7b	2024-09-02 00:00:00+00	\N	f		not_for_sale	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	2022
63c85edf-6641-4693-8540-aaa007e90b32	2024-10-26 13:21:02+00	2025-08-15 19:45:41+00	3c8e5c9f-67bf-4fc8-96e5-6731c7771344	12	\N	Karate	23	a3a6700c-3929-4322-898d-dacb5c579b23	2024-10-02 00:00:00+00	\N	f		worn	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	2023
7bad89c7-2a19-4d47-8da3-dd4dfbfac461	2024-08-22 01:55:10+00	2024-09-27 21:05:38+00	e8fd544f-1434-4ab3-b142-97c2198b8c4a	299	\N	Seatpost	181	262749a0-29e2-40f0-8010-c72ef94b2bc9	2024-06-07 00:00:00+00	\N	f		not_for_sale	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	2023
1a76ae31-d044-40e3-8990-fd63185411a7	2024-08-22 01:55:10+00	2024-09-27 21:05:44+00	e8fd544f-1434-4ab3-b142-97c2198b8c4a	1500	\N	3.4	800	c8b9dd2c-4c9a-4d67-9d22-456aa80ade11	2024-09-03 00:00:00+00	\N	f		not_for_sale	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	2022
98016677-6997-401b-9c03-a3fd7485280e	2024-08-22 01:55:10+00	2024-09-27 21:05:50+00	e8fd544f-1434-4ab3-b142-97c2198b8c4a	3833	\N	MOG	1000	97021dba-dea7-4652-afc8-7c93d151d181	2023-05-11 00:00:00+00	\N	f	mohawks.eu	not_for_sale	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	2023
3e810b7c-88a1-4dd6-826a-93a94db40ca3	2024-08-22 01:55:10+00	2024-11-02 22:46:40+00	2fe8ed6c-15d1-4a5d-a08b-7e8bf075338f	3290	\N	Evolve FS	1830	97021dba-dea7-4652-afc8-7c93d151d181	2023-05-16 00:00:00+00	\N	f	https://www.arc8bicycles.de	broken	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	2022
fd677759-0f30-4b2f-96d3-fec30c2ab677	2024-09-23 00:42:33+00	2024-09-27 22:34:26+00	8bf3e413-e135-4ed4-bc45-6da8b01da6b0	13	\N	Dingens	0	0a3cf8a6-e0fc-458a-8087-d795fe3eaf4a	2024-09-13 00:00:00+00	\N	f		broken	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	1913
5410e694-5fd6-46d1-8e11-0b96adb60287	2024-10-26 13:23:03+00	2024-11-03 00:57:31+00	c5a96472-aa8a-45d6-a994-fe2218519e15	13	\N	Judo	24	5cc985cf-7fb4-4b77-b900-b220ba8e9a68	2024-10-01 00:00:00+00	\N	f		broken	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	1987
0c4dbd10-fe54-4951-86f9-c90fec2cf507	2024-09-29 03:27:10+00	\N	e032f4a6-bf49-414d-b406-53ad84daa88d	33	\N	AFS Center Lock 160 mm	45	159bd122-a564-4d5c-9b70-678842c9d9c2	2024-09-04 00:00:00+00	\N	f		not_for_sale	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	2022
46e23f5c-cd4f-4fd8-8dad-55cbfee6f120	2024-08-22 01:55:10+00	2024-11-02 22:45:28+00	8bf3e413-e135-4ed4-bc45-6da8b01da6b0	10	\N	XTR	60	159bd122-a564-4d5c-9b70-678842c9d9c2	2024-09-03 00:00:00+00	\N	t		broken	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	2010
a2f3b294-bdb6-414d-a616-64fccc812aa3	2024-08-22 01:55:10+00	2025-07-17 17:11:09+00	8bf3e413-e135-4ed4-bc45-6da8b01da6b0	230	\N	XTR	150	4efea679-097d-4cc5-a32d-22300a449cf7	2024-09-11 00:00:00+00	\N	f		not_for_sale	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	2022
90429158-73e4-4aed-a7e3-79107729ef45	2024-08-22 01:55:10+00	2025-07-26 12:56:46+00	8bf3e413-e135-4ed4-bc45-6da8b01da6b0	200	\N	XTR	190	678aa860-40d7-4e81-9586-b2bc16c1c374	2024-09-02 00:00:00+00	\N	f		not_for_sale	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	2022
0f2a6bf0-ef43-444e-974c-cf0fe9b8ceb7	2024-09-28 14:11:33+00	2024-11-03 01:04:53+00	8bf3e413-e135-4ed4-bc45-6da8b01da6b0	200	\N	XX1	158	6ef4def2-4d9d-4669-9b50-49abdbd9ec0e	2023-03-13 00:00:00+00	\N	t		warranty_claim	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	2020
d82af1fa-e0db-4150-9f48-00c989cb98b2	2024-08-22 01:55:10+00	2025-09-02 15:46:00+00	f6dbad80-261a-49bb-b84e-5ac6dbbbbe8b	399	\N	In-Route Stem	131	33025e21-48d2-4766-a1e4-2ab713bfebc4	2024-08-02 00:00:00+00	\N	f		in_storage	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	2023
eb321b54-0123-404f-8909-a518ac0e1477	2024-08-22 01:55:10+00	2024-11-03 01:28:43+00	8bf3e413-e135-4ed4-bc45-6da8b01da6b0	30	\N	XTR	50	159bd122-a564-4d5c-9b70-678842c9d9c2	2024-09-05 00:00:00+00	\N	f		lost	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	2022
40c44f28-6f50-4f90-936c-f0cf35236f87	2025-04-05 23:20:50+00	\N	74df9378-6d04-4b69-80c0-2ef539680427	300	\N	Dings	900	7d70f6c5-66f7-4031-8ce7-4f21d8ed42f9	2024-05-06 00:00:00+00	\N	f		not_for_sale	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	2023
\.


--
-- Data for Name: part_status; Type: TABLE DATA; Schema: public; Owner: sebastianengel
--

COPY public.part_status (slug, name, available) FROM stdin;
in_storage	In storage	t
under_repair	Under repair	t
discarded	discarded	f
sold	sold	f
planned_for_sale	planned for sale	t
for_sale	for sale	t
not_for_sale	not for sale	t
stolen	stolen	f
lost	lost	f
broken	broken	f
worn	worn	f
warranty_claim	Warranty claim	t
\.


--
-- Data for Name: parts_type; Type: TABLE DATA; Schema: public; Owner: sebastianengel
--

COPY public.parts_type (id, created_at, updated_at, name, max_amount, service_interval) FROM stdin;
97021dba-dea7-4652-afc8-7c93d151d181	2024-08-22 01:55:10+00	\N	Frame	1	\N
0a3cf8a6-e0fc-458a-8087-d795fe3eaf4a	2024-08-22 01:55:10+00	\N	Handlebar	1	\N
33025e21-48d2-4766-a1e4-2ab713bfebc4	2024-08-22 01:55:10+00	\N	Stem	1	\N
857b2a3d-841f-4759-82dc-bf59f733920f	2024-08-22 01:55:10+00	\N	Saddle	1	\N
262749a0-29e2-40f0-8010-c72ef94b2bc9	2024-08-22 01:55:10+00	\N	Seatpost	1	\N
678aa860-40d7-4e81-9586-b2bc16c1c374	2024-08-22 01:55:10+00	\N	Pedal left	1	\N
4efea679-097d-4cc5-a32d-22300a449cf7	2024-08-22 01:55:10+00	\N	Pedal right	1	\N
d984ae12-ddab-47b7-9a19-6e9a8b7a8aa0	2024-08-22 01:55:10+00	\N	Crank	1	\N
ecd51a46-3fc7-4822-ab52-ae17d97eb4a8	2024-08-22 01:55:10+00	\N	Chainring	3	\N
1e43d3f7-0c09-4f80-828d-af2e86c946aa	2024-08-22 01:55:10+00	\N	Brake Front	1	\N
5b3280d3-94ff-43fc-aa34-30ce87028f1f	2024-08-22 01:55:10+00	\N	Brake rear	1	\N
c8b9dd2c-4c9a-4d67-9d22-456aa80ade11	2024-08-22 01:55:10+00	\N	Wheel rear	1	\N
704ffd21-e322-4d08-9ee8-9a4ee9476d7b	2024-08-22 01:55:10+00	\N	Wheel front	1	\N
6ef4def2-4d9d-4669-9b50-49abdbd9ec0e	2024-08-22 01:55:10+00	\N	Derailleur rear	1	\N
ee009b93-6a3b-4903-9142-780c9a4e0984	2024-08-22 01:55:10+00	\N	Derailleur front	1	\N
fe58b099-0332-4644-b1e7-34514e2c3b32	2024-08-22 01:55:10+00	\N	Bottom bracket	1	\N
a3a6700c-3929-4322-898d-dacb5c579b23	2024-08-22 01:55:10+00	\N	Bell	1	\N
55ab8a2a-68f4-40bc-9138-a19901001980	2024-08-22 01:55:10+00	\N	Grips	1	\N
7d70f6c5-66f7-4031-8ce7-4f21d8ed42f9	2024-08-22 01:55:10+00	\N	Fork	1	\N
e0f0ef9e-d324-4118-976d-8af6acebbc88	2024-08-22 01:55:10+00	\N	Shock	1	\N
5b1e28eb-d0f8-4c09-8637-a17250dae4ad	2024-08-22 01:55:10+00	\N	Headset	1	\N
7ce96678-6606-425b-ad18-3a91f1aa7ea7	2024-08-22 01:55:10+00	\N	Axle front	1	\N
981039e4-7b39-4290-88d5-b7482e559938	2024-08-22 01:55:10+00	\N	Axle rear	1	\N
de2afcd5-9bf4-4c03-aae0-23618fb8f708	2024-08-22 01:55:10+00	\N	Derailleur hanger	1	\N
565410ba-3e8e-4182-bc14-15f26a1ea7a1	2024-08-22 01:55:10+00	\N	Trigger	2	\N
159bd122-a564-4d5c-9b70-678842c9d9c2	2024-08-22 01:55:10+00	\N	Disk	2	\N
9c7fb361-ae5a-4afe-9d17-4c48dabc9633	2024-08-22 01:55:10+00	\N	Tyre	2	\N
df06f047-b5e4-4517-b781-43aa542e4f10	2024-08-22 01:55:10+00	\N	Tubeless sealant	2	\N
d7fc34c0-0958-48e9-bee9-6650f146fa98	2024-08-22 01:55:10+00	\N	Tube	2	\N
d6111073-db5c-408c-aa3a-df4cc09c8031	2024-08-22 01:55:10+00	\N	Tubeless insert	2	\N
ca29800a-afd7-41f2-a4e8-71c058cd9fcc	2024-08-22 01:55:10+00	\N	Spider	1	\N
9fc29923-7fc3-46ec-bda2-64f9dd9c84e2	2024-08-22 01:55:10+00	\N	Powermeter	1	\N
201aa03c-555c-4242-a0c3-f55f3d292217	2024-08-22 01:55:10+00	\N	Chain	1	\N
6b6cf7ae-f272-40d8-9a55-0caa04d99526	2024-08-22 01:55:10+00	\N	Cassette	1	\N
c200fd20-baa9-4176-952b-0815dc9add5e	2024-08-22 01:55:10+00	\N	Computer mount	1	\N
5954175c-db7d-4343-8eca-5b3a2bc929d0	2024-08-22 01:55:10+00	\N	Stem/Handlebar combo	1	\N
dd773323-8d60-4217-985a-3f92533bd92e	2024-08-22 01:55:10+00	\N	Seatclamp	1	\N
04243261-62ed-4490-8f17-d923e1ff0bdf	2024-08-22 01:55:10+00	\N	Breaklever front	1	\N
f4f8e58b-08a7-40ee-9774-ee7534ecd04b	2024-08-22 01:55:10+00	\N	Breaklever rear	1	\N
92d8eef5-3523-4e3c-89b5-daa0eb8c6828	2024-08-22 01:55:10+00	\N	Breaksaddle rear	1	\N
f65ca26d-ec9f-4418-abe8-a78ecd73677f	2024-08-22 01:55:10+00	\N	Breaksaddle front	1	\N
5cc985cf-7fb4-4b77-b900-b220ba8e9a68	2024-08-22 01:55:10+00	\N	Break pads	2	\N
\.


--
-- Data for Name: provider_type; Type: TABLE DATA; Schema: public; Owner: sebastianengel
--

COPY public.provider_type (value) FROM stdin;
credentials
email
oauth
oidc
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: sebastianengel
--

COPY public.sessions (id, "sessionToken", "userId", expires) FROM stdin;
f51ea745-e274-4bd7-9aa1-5756516ae42a	54104834-3325-48d8-a75e-b6f149c9547f	369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	2024-10-20 22:41:07.4+00
fbd2b82e-ac74-49f8-8e81-4d314631ddca	195e44d5-9f65-4324-ab8b-b46bc71eb309	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	2025-09-11 12:05:15.18+00
2b118f91-1b76-4b18-b247-9e1b7ebcd5b1	d972df60-2696-4f13-8a86-3ce206a05842	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	2025-09-11 12:09:04.593+00
6835e578-959b-4772-8a42-c136364ac449	a2331081-2c12-4fac-9e5b-19f1d80d56a4	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	2025-09-11 12:13:05.94+00
5c7e5296-e5d3-4780-9b00-4850b3562b4d	f33737dd-3a1b-4523-be3f-d7a896826740	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	2025-09-11 12:16:08.281+00
e828e2f5-db70-4a5d-819a-9926567123f9	161bad90-3ad0-4279-891e-80cece9b031c	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	2025-09-11 12:21:56.101+00
84825717-7fa0-4930-856e-b334a49be2f0	53718cfa-8f0c-4af5-87a6-1cc79672e747	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	2025-09-11 12:24:42.987+00
732a4ab3-7d0b-4e07-86a0-7156f6567dc6	5faafde5-e32c-40a8-8104-3c06738640f5	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	2025-09-11 12:54:35.797+00
\.


--
-- Data for Name: user_backup_codes; Type: TABLE DATA; Schema: public; Owner: sebastianengel
--

COPY public.user_backup_codes (id, user_id, code_hash, used_at, created_at) FROM stdin;
1d458f23-d33d-4262-9501-03b81cef8fb6	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$lW4CdZy7hNbL7n7DAtmJhug8RU3s1NWLxT.elKrH0wfXZ2ZqtXPHy	2025-08-13 14:42:54.876657+00	2025-08-13 12:14:08.066772+00
e7264903-b958-4577-a1e2-681d64c5e6ae	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$p/LT6ZlDbIueo/btIwak2.BPt7EdWuwGWtEF3oLodhGGf5aZv6Z0.	2025-08-13 14:42:54.876657+00	2025-08-13 12:14:08.066772+00
8a5a2674-bb0f-4c61-8708-1f96efcdbf67	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$/RityO.GMlDqAPBIK3K22u.EM1UQHnj./3b33xK6qkTBAwb8fA6lW	2025-08-13 14:42:54.876657+00	2025-08-13 12:14:08.066772+00
301ff239-01e0-4ef4-ad88-c882f16eb52e	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$iJTFaZ74AihamYsb9qUcUeUyLR3pXaaIplY75T3m..nwLZRWtB0j2	2025-08-13 14:42:54.876657+00	2025-08-13 12:14:08.066772+00
4148f53c-8c36-4e2b-8d03-9992b14bd363	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$pFnNZ1vgHwXTHnsYilGgiuSqHZ.Pl1mSlLf1R.M3fDfKUR3GyFd8O	2025-08-13 14:42:54.876657+00	2025-08-13 12:14:08.066772+00
8176f6ac-afe5-48ef-9067-af6b592bc5aa	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$4DH.AsQ/ZhYxsxtQZDiMZed3fDQ80hKqi6.WAOM9SoNBh8naXUPfC	2025-08-13 14:42:54.876657+00	2025-08-13 12:14:08.066772+00
46cd7924-5376-45ac-be65-c141ca4ee067	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$Mfsb/zkMHnMSbSd/wBL21Ob5ntrtQRu8mw4BuaQ7wSSkI20ezlxje	2025-08-13 14:42:54.876657+00	2025-08-13 12:14:08.066772+00
4bed8f7e-ab97-4dfb-a690-1fe518dabaad	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$GhYXIPeGE1nNtNymFCQXDeVLjAYxvHY0/F7eE5qX5jQE6dpq/M2/O	2025-08-13 14:42:54.876657+00	2025-08-13 12:14:08.066772+00
b6791807-9b1e-4e0f-af9d-f66fdb971775	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$foO9V0u/4ta400HzjG1weOZbeB5zQzBX6wCHLLKqDeBiG75q0Oej.	2025-08-13 14:42:54.876657+00	2025-08-13 12:46:14.242472+00
d23b914e-ffa9-4da6-8aef-be570cebd29d	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$5GyMg8v5sY/cARizcg3FluqnnySWCga/tSuYmkpvhPifzyPEymrlO	2025-08-13 14:42:54.876657+00	2025-08-13 12:46:14.242472+00
7b801ba7-c69a-479e-a66d-bd180ab9599b	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$NDbtvcQf0pQKQ1.9O6V2KeBhYtcwhWpDTEmaiBaahGY27R/I080DG	2025-08-13 14:42:54.876657+00	2025-08-13 12:46:14.242472+00
566de83d-30f1-49d4-becd-ddd16ae86301	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$E1Dtca1F47lQxAp2Y.zY/.Tby0vh2vgRtrICRJfrxRxhmqSFpuxPi	2025-08-13 14:42:54.876657+00	2025-08-13 12:46:14.242472+00
ae4ed255-dd8a-4b60-ba4f-d593ab64b030	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$fGl7ND67z7G/nm0pClmLkO3PbFT9ACsDwK9aCv/vYEpOMAocl/Fm.	2025-08-13 14:42:54.876657+00	2025-08-13 12:46:14.242472+00
e4e4333a-d3a0-4174-88d4-c588f4744ea6	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$7gT/wUl94xyEYp1rCjIimeO.eANzEdsptzBUjTK2b0.UhH2mbx8GC	2025-08-13 14:42:54.876657+00	2025-08-13 12:46:14.242472+00
9f7f397b-8094-4ee5-bec0-63d7c7ae09ad	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$4cNZCOfFbUfWSSi5eF78vunISjSpBl81PxBGYVnaJZTGyTWc5baMS	2025-08-13 14:42:54.876657+00	2025-08-13 12:46:14.242472+00
e35b2545-8f79-4fd8-af69-fbc2550c97b2	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$27PvinLugBJWe4v33ozmuenO/VuS3lsGRSZLXNoo5HeZ7zVQ3Cy1e	2025-08-13 14:42:54.876657+00	2025-08-13 12:46:14.242472+00
9cd6f7ad-04ad-4953-8f09-ee48310276e9	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$lOA3ueiAq62ZI5y0OaxHmujKwDi7f1CnHa5K2gS4mPyoGZyGsxdp6	2025-08-13 14:42:54.876657+00	2025-08-13 14:03:52.811626+00
2707c12f-891e-4c07-b9de-8a7a809d518b	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$brKlHmXpTeel9rrTXzFZxuXnWkbVIU5EfXY7Iz1o7XSsZD6cJDRN2	2025-08-13 14:42:54.876657+00	2025-08-13 14:03:52.811626+00
867857d7-3cf2-4006-9b62-7f2132826a54	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$Ze7Wo7822mTLdUffwy64fukuvaYERfSgNpBEmTIEmrht/US/cGtWO	2025-08-13 14:42:54.876657+00	2025-08-13 14:03:52.811626+00
9f44579d-b981-4b39-b64d-3146a0e24b2a	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$BR2DGip4z8ojmW9KCwCQ8.i4wH68zWPwzUsuwl.oPO2rGei7Tgw6K	2025-08-13 14:42:54.876657+00	2025-08-13 14:03:52.811626+00
31a29cbd-3461-4932-8f10-02f411d93d96	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$JYdQ9OUOQ82SMyooZl6Yie6tzs/I4QpJROH1eMDdlJqklJ6MwKuyC	2025-08-13 14:42:54.876657+00	2025-08-13 14:03:52.811626+00
fac1bcae-842c-4e94-8b2e-390f38f4a1b7	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$vQsVGKNhOZ1JBQehLnIbguwCH4Q4Gjb0cezx5EVqM0A2v.F3fPCAm	2025-08-13 14:42:54.876657+00	2025-08-13 14:03:52.811626+00
5324df92-4c28-46a5-adf9-2cb28eef52a0	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$6eRHs6rsjM7yWiTtQej1Tu7ZB7A9E6gpgSm9bf5hMkaw16vtZDRbm	2025-08-13 14:42:54.876657+00	2025-08-13 14:03:52.811626+00
d81baea3-b0f9-4c18-8971-efb1b9c51357	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$Gx19LiEjingfKSWffkCb1u1lttiIRxekZZYizbxCmbCpX0F5L0Xbq	2025-08-13 14:42:54.876657+00	2025-08-13 14:03:52.811626+00
e7d8d762-6c5b-4e46-8031-47ad0070f074	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$TaEgzTpUx8f8HRo9Ql5bt.gatgomIKtGBPT/8Y.RBy8fZEEOaAb6a	\N	2025-08-13 14:43:37.712799+00
e92f7e75-9408-466c-81d7-b78eab2b27a9	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$ZHG4YLvXd64OMt0s.Oi9lOjGnD8cWPjqlZU1Mi2UOK2PuTlK4BxTq	\N	2025-08-13 14:43:37.712799+00
ca04ca0f-25a4-4838-82b9-c1a78a4aed0d	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$gnp0CNJ3Fx22d2Oq3shhOuwplHMbIn0kn7jrm1Kj4Zlc9VqQBc.oa	\N	2025-08-13 14:43:37.712799+00
8b164290-c345-473b-b1c1-1244228d0d0d	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$9IAadNjcfJw3ReU5DIcM6.v8YahFWTQOknCtau9..X26wcemsCoOW	\N	2025-08-13 14:43:37.712799+00
10310460-f991-4b33-b2a4-319d45876c35	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$3wnG64uE7U5c3e0tuPuDCePiIqtIVS6ICdya5SkY/QNyXd1hwQBwm	\N	2025-08-13 14:43:37.712799+00
2e56094f-d757-4f0d-aa5e-9ac1e4cd99dc	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$EdyYL1TjHcEU9RY5ZQAJ3epnGjAj2qMemuSAIzI75FQeqAFMb9/om	\N	2025-08-13 14:43:37.712799+00
36d40df6-a99a-4470-95de-67dba95d828e	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$5a9FgxqFLzxkfkPVfHrO7Ok6zATb2.YkZk0t07X2RMdVCr9UWReZ6	\N	2025-08-13 14:43:37.712799+00
5cd45483-f4cc-4157-ab57-afa2e13f4fec	3ddcfc2c-7838-41af-bcfa-729388f8d4f1	$2b$12$rosqoiBCS9dym.8bnUOoKOrBZXQr8v3./3lmI3agYs/mSOm3GtV2e	\N	2025-08-13 14:43:37.712799+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: sebastianengel
--

COPY public.users (id, name, email, "emailVerified", image, currency_unit, created_at, last_seen_at, updated_at, strava_user, weight_unit, distance_unit, strava_id, strava_access_token, strava_refresh_token, strava_expires_at, strava_connected_at, password, mfa_enabled, mfa_secret, backup_codes_generated_at, webauthn_enabled, webauthn_challenge) FROM stdin;
369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445	Juuro	sassellan@googlemail.com	\N	https://res.cloudinary.com/juuro-dev/image/upload/v1754233455/bike-parts-tracker/profile-images/profile_369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445_1754233454978.jpg	EUR	2024-08-22 02:02:25+00	\N	2025-08-19 09:04:50+00	\N	g	km	3909840	49edbb0bcefcb6645ab4319af338df5ecd81e2a6	b32db94a959e351d6f4365b35c89796e180f3303	1755615890	2025-08-03 13:45:47.547544+00	\N	f	\N	\N	f	\N
3ddcfc2c-7838-41af-bcfa-729388f8d4f1	Sassellan	juurian@icloud.com	\N	\N	USD	2025-08-05 19:45:54+00	\N	2025-08-13 14:43:38+00	\N	g	km	\N	\N	\N	\N	\N	$2b$12$PfHfIagrGmoanZ6XEnH2DuKFx3jFhZB4vOLlC4J3dH/oh6DlBRNju	t	JMVFWOD4KETBCFZI	2025-08-13 14:43:37.712799+00	f	\N
\.


--
-- Data for Name: verification_tokens; Type: TABLE DATA; Schema: public; Owner: sebastianengel
--

COPY public.verification_tokens (token, identifier, expires) FROM stdin;
\.


--
-- Data for Name: weight_unit; Type: TABLE DATA; Schema: public; Owner: sebastianengel
--

COPY public.weight_unit (unit, label) FROM stdin;
g	Gram
lbs	Pound
\.


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: authenticators authenticators_credential_id_key; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.authenticators
    ADD CONSTRAINT authenticators_credential_id_key UNIQUE (credential_id);


--
-- Name: authenticators authenticators_pkey; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.authenticators
    ADD CONSTRAINT authenticators_pkey PRIMARY KEY (id);


--
-- Name: authenticators authenticators_user_id_idx; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.authenticators
    ADD CONSTRAINT authenticators_user_id_idx UNIQUE (user_id, credential_id);


--
-- Name: user_backup_codes backup_codes_user_id_idx; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.user_backup_codes
    ADD CONSTRAINT backup_codes_user_id_idx UNIQUE (user_id, code_hash);


--
-- Name: bike bike_pkey; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.bike
    ADD CONSTRAINT bike_pkey PRIMARY KEY (id);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);


--
-- Name: currency_unit currency_unit_label_key; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.currency_unit
    ADD CONSTRAINT currency_unit_label_key UNIQUE (label);


--
-- Name: currency_unit currency_unit_pkey; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.currency_unit
    ADD CONSTRAINT currency_unit_pkey PRIMARY KEY (unit);


--
-- Name: currency_unit currency_unit_unit_key; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.currency_unit
    ADD CONSTRAINT currency_unit_unit_key UNIQUE (unit);


--
-- Name: discipline discipline_pkey; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.discipline
    ADD CONSTRAINT discipline_pkey PRIMARY KEY (id);


--
-- Name: distance_unit distance_unit_pkey; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.distance_unit
    ADD CONSTRAINT distance_unit_pkey PRIMARY KEY (unit);


--
-- Name: distance_unit distance_unit_unit_key; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.distance_unit
    ADD CONSTRAINT distance_unit_unit_key UNIQUE (unit);


--
-- Name: installation installation_pkey; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.installation
    ADD CONSTRAINT installation_pkey PRIMARY KEY (id);


--
-- Name: manufacturer manufacturer_pkey; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.manufacturer
    ADD CONSTRAINT manufacturer_pkey PRIMARY KEY (id);


--
-- Name: part part_pkey; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.part
    ADD CONSTRAINT part_pkey PRIMARY KEY (id);


--
-- Name: parts_type parts_type_pkey; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.parts_type
    ADD CONSTRAINT parts_type_pkey PRIMARY KEY (id);


--
-- Name: provider_type provider_type_pkey; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.provider_type
    ADD CONSTRAINT provider_type_pkey PRIMARY KEY (value);


--
-- Name: part_status sell_status_pkey; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.part_status
    ADD CONSTRAINT sell_status_pkey PRIMARY KEY (slug);


--
-- Name: part_status sell_status_slug_key; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.part_status
    ADD CONSTRAINT sell_status_slug_key UNIQUE (slug);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY ("sessionToken");


--
-- Name: user_backup_codes user_backup_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.user_backup_codes
    ADD CONSTRAINT user_backup_codes_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: verification_tokens verification_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.verification_tokens
    ADD CONSTRAINT verification_tokens_pkey PRIMARY KEY (token);


--
-- Name: weight_unit weight_unit_pkey; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.weight_unit
    ADD CONSTRAINT weight_unit_pkey PRIMARY KEY (unit);


--
-- Name: weight_unit weight_unit_unit_key; Type: CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.weight_unit
    ADD CONSTRAINT weight_unit_unit_key UNIQUE (unit);


--
-- Name: idx_authenticators_credential_id; Type: INDEX; Schema: public; Owner: sebastianengel
--

CREATE INDEX idx_authenticators_credential_id ON public.authenticators USING btree (credential_id);


--
-- Name: idx_authenticators_user_id; Type: INDEX; Schema: public; Owner: sebastianengel
--

CREATE INDEX idx_authenticators_user_id ON public.authenticators USING btree (user_id);


--
-- Name: idx_backup_codes_unused; Type: INDEX; Schema: public; Owner: sebastianengel
--

CREATE INDEX idx_backup_codes_unused ON public.user_backup_codes USING btree (user_id, used_at) WHERE (used_at IS NULL);


--
-- Name: idx_backup_codes_user_id; Type: INDEX; Schema: public; Owner: sebastianengel
--

CREATE INDEX idx_backup_codes_user_id ON public.user_backup_codes USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: sebastianengel
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: bike set_updated_at; Type: TRIGGER; Schema: public; Owner: sebastianengel
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.bike FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: manufacturer set_updated_at; Type: TRIGGER; Schema: public; Owner: sebastianengel
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.manufacturer FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: part set_updated_at; Type: TRIGGER; Schema: public; Owner: sebastianengel
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.part FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: parts_type set_updated_at; Type: TRIGGER; Schema: public; Owner: sebastianengel
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.parts_type FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users set_updated_at; Type: TRIGGER; Schema: public; Owner: sebastianengel
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: accounts accounts_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_type_fkey FOREIGN KEY (type) REFERENCES public.provider_type(value) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: accounts accounts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: authenticators authenticators_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.authenticators
    ADD CONSTRAINT authenticators_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: bike bike_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.bike
    ADD CONSTRAINT bike_category_id_foreign FOREIGN KEY (category_id) REFERENCES public.category(id);


--
-- Name: bike bike_discipline_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.bike
    ADD CONSTRAINT bike_discipline_id_foreign FOREIGN KEY (discipline_id) REFERENCES public.discipline(id);


--
-- Name: bike bike_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.bike
    ADD CONSTRAINT bike_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: installation installation_bike_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.installation
    ADD CONSTRAINT installation_bike_id_foreign FOREIGN KEY (bike_id) REFERENCES public.bike(id);


--
-- Name: installation installation_part_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.installation
    ADD CONSTRAINT installation_part_id_foreign FOREIGN KEY (part_id) REFERENCES public.part(id);


--
-- Name: part part_manufacturer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.part
    ADD CONSTRAINT part_manufacturer_id_foreign FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturer(id);


--
-- Name: part part_part_status_slug_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.part
    ADD CONSTRAINT part_part_status_slug_fkey FOREIGN KEY (part_status_slug) REFERENCES public.part_status(slug) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: part part_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.part
    ADD CONSTRAINT part_type_id_foreign FOREIGN KEY (type_id) REFERENCES public.parts_type(id);


--
-- Name: part part_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.part
    ADD CONSTRAINT part_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: user_backup_codes user_backup_codes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.user_backup_codes
    ADD CONSTRAINT user_backup_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_currency_unit_foreign; Type: FK CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_currency_unit_foreign FOREIGN KEY (currency_unit) REFERENCES public.currency_unit(unit);


--
-- Name: users users_distance_unit_foreign; Type: FK CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_distance_unit_foreign FOREIGN KEY (distance_unit) REFERENCES public.distance_unit(unit);


--
-- Name: users users_weight_unit_foreign; Type: FK CONSTRAINT; Schema: public; Owner: sebastianengel
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_weight_unit_foreign FOREIGN KEY (weight_unit) REFERENCES public.weight_unit(unit);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: sebastianengel
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES  TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--


