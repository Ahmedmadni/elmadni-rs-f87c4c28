
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;

DROP POLICY "Public can view property images" ON storage.objects;
CREATE POLICY "Public can view property images"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'property-images' AND (storage.foldername(name))[1] IS NOT NULL);
