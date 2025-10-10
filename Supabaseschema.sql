-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.call_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  retell_event text NOT NULL,
  retell_call_id text NOT NULL UNIQUE,
  retell_agent_id text NOT NULL,
  retell_agent_version text,
  call_status text NOT NULL,
  start_timestamp timestamp with time zone NOT NULL,
  end_timestamp timestamp with time zone,
  duration_ms integer,
  transcript text,
  recording_url text,
  disconnection_reason text,
  llm_latency jsonb,
  e2e_latency jsonb,
  tts_latency jsonb,
  call_costs jsonb,
  total_duration_unit_price numeric,
  total_duration_seconds integer,
  combined_cost numeric,
  call_summary text,
  user_sentiment text,
  call_successful boolean,
  detailed_call_summary text,
  customer_first_name text,
  customer_last_name text,
  customer_email text,
  customer_phone text,
  move_in_date text,
  bedrooms_requested smallint,
  people_count smallint,
  pets_info text,
  amenities_requested text,
  location_preferences text,
  tour_scheduled_for text,
  call_back_requested boolean,
  opt_out_sensitive_data_storage boolean,
  data_storage_setting text,
  opt_in_signed_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT call_records_pkey PRIMARY KEY (id),
  CONSTRAINT call_records_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
  CONSTRAINT call_records_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.properties (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  retell_agent_id text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT properties_pkey PRIMARY KEY (id),
  CONSTRAINT properties_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  organization_id uuid NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_profiles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);