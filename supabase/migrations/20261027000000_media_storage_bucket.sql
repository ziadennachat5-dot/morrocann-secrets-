INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = true;

DROP POLICY IF EXISTS "Public can read media objects" ON storage.objects;
CREATE POLICY "Public can read media objects"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Admins can upload media objects" ON storage.objects;
CREATE POLICY "Admins can upload media objects"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update media objects" ON storage.objects;
CREATE POLICY "Admins can update media objects"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_admin())
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete media objects" ON storage.objects;
CREATE POLICY "Admins can delete media objects"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_admin());
