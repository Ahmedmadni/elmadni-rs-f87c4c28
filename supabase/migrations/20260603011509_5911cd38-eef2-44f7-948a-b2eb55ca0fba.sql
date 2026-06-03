
-- 1) Marketer can update properties (publish toggle). Trigger could lock to publish-only,
-- but a scoped UPDATE policy is the minimum needed; keep it auth-only.
CREATE POLICY "Marketers update properties"
ON public.properties
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'marketer'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'marketer'::app_role));

-- 2) Replace the permissive anon-insert policy on purchase_requests
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
  AND EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id
      AND p.published = true
      AND p.review_status = 'approved'::property_status
  )
);
