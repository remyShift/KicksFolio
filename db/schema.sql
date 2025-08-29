-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.brands (
  id integer NOT NULL DEFAULT nextval('brands_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  CONSTRAINT brands_pkey PRIMARY KEY (id)
);
CREATE TABLE public.collections (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  sneaker_id uuid NOT NULL,
  size_eu numeric NOT NULL CHECK (size_eu >= 35::numeric AND size_eu <= 50::numeric AND size_eu IS NOT NULL),
  size_us numeric NOT NULL CHECK (size_us >= 3::numeric AND size_us <= 17::numeric AND size_us IS NOT NULL),
  og_box boolean,
  ds boolean,
  purchase_date date,
  price_paid numeric,
  condition integer NOT NULL CHECK (condition >= 1 AND condition <= 10),
  estimated_value numeric,
  images ARRAY DEFAULT ARRAY[]::text[],
  wishlist boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status_id integer,
  CONSTRAINT collections_pkey PRIMARY KEY (id),
  CONSTRAINT collections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT collections_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.statuses(id),
  CONSTRAINT collections_sneaker_id_fkey FOREIGN KEY (sneaker_id) REFERENCES public.sneakers(id)
);
CREATE TABLE public.followers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT followers_pkey PRIMARY KEY (id),
  CONSTRAINT followers_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id),
  CONSTRAINT followers_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  recipient_id uuid NOT NULL,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['single_sneaker_added'::character varying, 'multiple_sneakers_added'::character varying]::text[])),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  title character varying NOT NULL,
  body text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id)
);
CREATE TABLE public.push_tokens (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  expo_token character varying NOT NULL UNIQUE,
  device_id character varying,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT push_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT push_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.shared_collections (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  share_token character varying NOT NULL UNIQUE,
  filters jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shared_collections_pkey PRIMARY KEY (id),
  CONSTRAINT shared_collections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.sneakers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  model character varying NOT NULL,
  gender text NOT NULL CHECK (gender = ANY (ARRAY['men'::text, 'women'::text])),
  sku character varying,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  image text,
  brand_id integer,
  CONSTRAINT sneakers_pkey PRIMARY KEY (id),
  CONSTRAINT sneakers_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id)
);
CREATE TABLE public.statuses (
  id integer NOT NULL DEFAULT nextval('statuses_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  CONSTRAINT statuses_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email character varying NOT NULL UNIQUE,
  password_hash character varying,
  username character varying NOT NULL UNIQUE,
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  sneaker_size numeric NOT NULL CHECK (sneaker_size >= 7::numeric AND sneaker_size <= 48::numeric AND mod((sneaker_size * 2::numeric)::integer, 1) = 0),
  profile_picture character varying,
  reset_password_token character varying UNIQUE,
  reset_password_sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  instagram_username character varying,
  social_media_visibility boolean DEFAULT true,
  following_additions_enabled boolean DEFAULT true,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.wishlists (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  sneaker_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT wishlists_pkey PRIMARY KEY (id),
  CONSTRAINT wishlists_sneaker_id_fkey FOREIGN KEY (sneaker_id) REFERENCES public.sneakers(id),
  CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);