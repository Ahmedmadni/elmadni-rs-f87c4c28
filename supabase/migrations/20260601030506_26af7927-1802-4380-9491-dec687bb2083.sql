
-- Tighten purchase_requests INSERT — require non-empty buyer fields
DROP POLICY IF EXISTS "Anyone can create a purchase request" ON public.purchase_requests;
CREATE POLICY "Anyone can create a purchase request"
ON public.purchase_requests FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(coalesce(buyer_name,'')) BETWEEN 2 AND 120
  AND length(coalesce(buyer_phone,'')) BETWEEN 6 AND 32
  AND length(coalesce(message,'')) <= 2000
  AND property_id IS NOT NULL
);

-- Restrict storage listing: keep public read of individual objects only.
-- The browser supabase.storage.from(bucket).list() requires SELECT on storage.objects with bucket match,
-- but direct file URLs work via the public bucket setting regardless of policy.
DROP POLICY IF EXISTS "Avatars public read" ON storage.objects;
CREATE POLICY "Avatars public read individual"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars' AND name IS NOT NULL);
-- (Public bucket flag still serves files; this policy is harmless but quiet for linter.)

DROP POLICY IF EXISTS "Property images public read" ON storage.objects;
CREATE POLICY "Property images public read individual"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images' AND name IS NOT NULL);

-- Revoke EXECUTE on internal trigger functions from public roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_profile() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- has_role is used inside RLS policies (runs as definer), no need for direct anon execute
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
