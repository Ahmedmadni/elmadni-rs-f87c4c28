-- 1) Revoke has_role() EXECUTE from authenticated to prevent admin enumeration.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

-- 2) Hide contact fields from anonymous visitors via column-level revoke.
REVOKE SELECT (contact_name, contact_phone) ON public.properties FROM anon;

-- 3) Tighten purchase_requests anon INSERT policy: prevent buyer_user_id impersonation.
DROP POLICY IF EXISTS "Anyone can create a purchase request" ON public.purchase_requests;
CREATE POLICY "Anyone can create a purchase request"
  ON public.purchase_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(COALESCE(buyer_name, '')) BETWEEN 2 AND 120
    AND length(COALESCE(buyer_phone, '')) BETWEEN 6 AND 32
    AND length(COALESCE(message, '')) <= 2000
    AND property_id IS NOT NULL
    AND (
      (auth.uid() IS NULL AND buyer_user_id IS NULL)
      OR (auth.uid() IS NOT NULL AND (buyer_user_id IS NULL OR buyer_user_id = auth.uid()))
    )
  );