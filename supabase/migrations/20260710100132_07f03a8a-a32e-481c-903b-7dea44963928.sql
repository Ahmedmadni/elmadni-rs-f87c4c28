DROP POLICY IF EXISTS "Marketers update own properties" ON public.properties;

CREATE POLICY "Marketers update own properties"
ON public.properties
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'marketer'::app_role)
  AND owner_id = auth.uid()
)
WITH CHECK (
  public.has_role(auth.uid(), 'marketer'::app_role)
  AND owner_id = auth.uid()
  AND review_status IN ('pending'::property_status, 'rejected'::property_status)
  AND published = false
);