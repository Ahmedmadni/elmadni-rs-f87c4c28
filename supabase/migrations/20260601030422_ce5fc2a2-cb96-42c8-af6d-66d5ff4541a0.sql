
-- =========================================================
-- Phase 1: Expand properties + create supporting tables
-- =========================================================

-- 1) status enum
DO $$ BEGIN
  CREATE TYPE public.property_status AS ENUM ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.purchase_request_status AS ENUM ('new','contacted','closed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Add columns to properties (keep existing text "status" column for backward compat,
--    add new "review_status" enum so we don't break existing data)
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS owner_id uuid,
  ADD COLUMN IF NOT EXISTS review_status public.property_status NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS description_full text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS purpose text,
  ADD COLUMN IF NOT EXISTS bedrooms integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bathrooms integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS contact_phone text;

CREATE INDEX IF NOT EXISTS idx_properties_owner ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_review_status ON public.properties(review_status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);

-- Drop old public-read policy and replace with one that also checks review_status
DROP POLICY IF EXISTS "Public can view published properties" ON public.properties;
CREATE POLICY "Public can view approved published properties"
ON public.properties FOR SELECT
TO anon, authenticated
USING (
  (published = true AND review_status = 'approved')
  OR has_role(auth.uid(), 'admin'::app_role)
  OR (auth.uid() IS NOT NULL AND owner_id = auth.uid())
);

-- Owners can insert their own properties (pending by default at app layer)
DROP POLICY IF EXISTS "Owners insert their own properties" ON public.properties;
CREATE POLICY "Owners insert their own properties"
ON public.properties FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Owners can update their own pending properties
DROP POLICY IF EXISTS "Owners update own pending properties" ON public.properties;
CREATE POLICY "Owners update own pending properties"
ON public.properties FOR UPDATE
TO authenticated
USING (
  (owner_id = auth.uid() AND review_status = 'pending')
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  (owner_id = auth.uid() AND review_status = 'pending')
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Owners can delete their own pending properties
DROP POLICY IF EXISTS "Owners delete own pending properties" ON public.properties;
CREATE POLICY "Owners delete own pending properties"
ON public.properties FOR DELETE
TO authenticated
USING (
  (owner_id = auth.uid() AND review_status = 'pending')
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- =========================================================
-- 3) profiles
-- =========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile or admin reads all"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Also ensure role trigger is attached
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- =========================================================
-- 4) property_images
-- =========================================================
CREATE TABLE IF NOT EXISTS public.property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_property_images_property ON public.property_images(property_id);

GRANT SELECT ON public.property_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_images TO authenticated;
GRANT ALL ON public.property_images TO service_role;

ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view images of approved properties"
ON public.property_images FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id
      AND ((p.published = true AND p.review_status = 'approved')
           OR has_role(auth.uid(), 'admin'::app_role)
           OR (auth.uid() IS NOT NULL AND p.owner_id = auth.uid()))
  )
);

CREATE POLICY "Owners manage images of own properties"
ON public.property_images FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id
      AND (p.owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id
      AND (p.owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- =========================================================
-- 5) purchase_requests
-- =========================================================
CREATE TABLE IF NOT EXISTS public.purchase_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  buyer_user_id uuid,
  buyer_name text NOT NULL,
  buyer_email text,
  buyer_phone text NOT NULL,
  message text,
  status public.purchase_request_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchase_requests_property ON public.purchase_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_buyer ON public.purchase_requests(buyer_user_id);

GRANT INSERT ON public.purchase_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.purchase_requests TO authenticated;
GRANT ALL ON public.purchase_requests TO service_role;

ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a purchase request"
ON public.purchase_requests FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Owner/buyer/admin can view request"
ON public.purchase_requests FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR buyer_user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Owner/admin can update request"
ON public.purchase_requests FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id AND p.owner_id = auth.uid()
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Admin can delete request"
ON public.purchase_requests FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_pr_updated_at
BEFORE UPDATE ON public.purchase_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- 6) property_status_history
-- =========================================================
CREATE TABLE IF NOT EXISTS public.property_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  old_status public.property_status,
  new_status public.property_status NOT NULL,
  changed_by uuid,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_psh_property ON public.property_status_history(property_id);

GRANT SELECT ON public.property_status_history TO authenticated;
GRANT ALL ON public.property_status_history TO service_role;

ALTER TABLE public.property_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner/admin view history"
ON public.property_status_history FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id AND p.owner_id = auth.uid()
  )
);

-- =========================================================
-- 7) notifications
-- =========================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users mark own notifications read"
ON public.notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- =========================================================
-- 8) Storage buckets
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- avatars policies
DROP POLICY IF EXISTS "Avatars public read" ON storage.objects;
CREATE POLICY "Avatars public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatars users upload own" ON storage.objects;
CREATE POLICY "Avatars users upload own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Avatars users update own" ON storage.objects;
CREATE POLICY "Avatars users update own"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Avatars users delete own" ON storage.objects;
CREATE POLICY "Avatars users delete own"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- property-images policies (bucket already exists)
DROP POLICY IF EXISTS "Property images public read" ON storage.objects;
CREATE POLICY "Property images public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Property images users upload own folder" ON storage.objects;
CREATE POLICY "Property images users upload own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

DROP POLICY IF EXISTS "Property images users update own folder" ON storage.objects;
CREATE POLICY "Property images users update own folder"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-images'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

DROP POLICY IF EXISTS "Property images users delete own folder" ON storage.objects;
CREATE POLICY "Property images users delete own folder"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);
