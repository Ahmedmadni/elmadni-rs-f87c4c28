-- 1) Lock down audit_logs INSERT to service_role only
DROP POLICY IF EXISTS "Authenticated insert audit logs" ON public.audit_logs;
-- service_role bypasses RLS, no explicit policy needed; INSERTs from app code must go through a server fn using supabaseAdmin

-- 2) Tighten storage SELECT for property-images so unpublished/rejected images can't be read by knowing the path
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Property images public read individual" ON storage.objects;

CREATE POLICY "Property images visible only for approved or owned"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'property-images'
  AND (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE (storage.foldername(name))[1] = p.owner_id::text
        AND p.published = true
        AND p.review_status = 'approved'::public.property_status
    )
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR (auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
  )
);