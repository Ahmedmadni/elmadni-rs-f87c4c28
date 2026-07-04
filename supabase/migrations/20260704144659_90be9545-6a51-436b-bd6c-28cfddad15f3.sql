
-- Restrict marketers to updating only properties they own; drop the overly-broad policy
DROP POLICY IF EXISTS "Marketers update properties" ON public.properties;
CREATE POLICY "Marketers update own properties"
ON public.properties
FOR UPDATE
USING (has_role(auth.uid(), 'marketer'::app_role) AND owner_id = auth.uid())
WITH CHECK (has_role(auth.uid(), 'marketer'::app_role) AND owner_id = auth.uid());

-- Harden storage SELECT policy: ensure owner_id is not null when matching folder
DROP POLICY IF EXISTS "Property images visible only for approved or owned" ON storage.objects;
CREATE POLICY "Property images visible only for approved or owned"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'property-images'
  AND (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.owner_id IS NOT NULL
        AND (storage.foldername(objects.name))[1] = p.owner_id::text
        AND p.published = true
        AND p.review_status = 'approved'::property_status
    )
    OR has_role(auth.uid(), 'admin'::app_role)
    OR (
      auth.uid() IS NOT NULL
      AND (storage.foldername(name))[1] = auth.uid()::text
    )
  )
);
