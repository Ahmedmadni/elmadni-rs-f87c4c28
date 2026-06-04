
-- 1) Sequential code generator
CREATE SEQUENCE IF NOT EXISTS public.property_code_seq START WITH 1000 INCREMENT BY 1;
GRANT USAGE ON SEQUENCE public.property_code_seq TO authenticated, service_role;

-- Seed sequence past any existing numeric code so we never collide
DO $$
DECLARE max_n BIGINT;
BEGIN
  SELECT COALESCE(MAX((regexp_replace(code, '\D', '', 'g'))::BIGINT), 999) INTO max_n
  FROM public.properties
  WHERE code ~ '\d';
  PERFORM setval('public.property_code_seq', GREATEST(max_n, 999), true);
END $$;

CREATE OR REPLACE FUNCTION public.gen_property_code()
RETURNS TEXT
LANGUAGE sql
VOLATILE
SET search_path = public
AS $$
  SELECT 'MAD-' || nextval('public.property_code_seq')::TEXT;
$$;

ALTER TABLE public.properties ALTER COLUMN code SET DEFAULT public.gen_property_code();

-- 2) Triggers: ignore any client-supplied code on insert; forbid changes on update
CREATE OR REPLACE FUNCTION public.enforce_property_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.code := public.gen_property_code();
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.code := OLD.code;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_property_code_ins ON public.properties;
CREATE TRIGGER trg_enforce_property_code_ins
BEFORE INSERT ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.enforce_property_code();

DROP TRIGGER IF EXISTS trg_enforce_property_code_upd ON public.properties;
CREATE TRIGGER trg_enforce_property_code_upd
BEFORE UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.enforce_property_code();

-- Ensure uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS properties_code_unique ON public.properties (code);

-- 3) Tighten insert policy: non-admins must submit as pending + unpublished
DROP POLICY IF EXISTS "Owners insert their own properties" ON public.properties;
CREATE POLICY "Owners insert their own properties"
ON public.properties
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    owner_id = auth.uid()
    AND review_status = 'pending'::property_status
    AND published = false
  )
);
