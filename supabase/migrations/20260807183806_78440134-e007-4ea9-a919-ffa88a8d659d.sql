DROP POLICY IF EXISTS "Avatars public read individual" ON storage.objects;

CREATE POLICY "Avatars owner or admin read"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);