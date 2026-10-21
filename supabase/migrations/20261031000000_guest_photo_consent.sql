INSERT INTO storage.buckets (id, name, public)
VALUES ('guest-photos', 'guest-photos', false)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = false;

CREATE TABLE public.guest_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_file text UNIQUE,
  storage_path text NOT NULL UNIQUE,
  renditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  alt jsonb NOT NULL DEFAULT '{"en":"","fr":"","ar":""}'::jsonb,
  sort_order integer NOT NULL,
  guest_consent_confirmed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT guest_photos_sort_order_nonnegative CHECK (sort_order >= 0),
  CONSTRAINT guest_photos_alt_localized_object CHECK (
    jsonb_typeof(alt) = 'object'
    AND jsonb_typeof(alt->'en') = 'string'
    AND jsonb_typeof(alt->'fr') = 'string'
    AND jsonb_typeof(alt->'ar') = 'string'
  ),
  CONSTRAINT guest_photos_renditions_array CHECK (jsonb_typeof(renditions) = 'array'),
  CONSTRAINT guest_photos_consent_requires_alt CHECK (
    NOT guest_consent_confirmed OR length(btrim(alt->>'en')) > 0
  )
);

ALTER TABLE public.guest_photos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.guest_photos FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guest_photos TO authenticated;
GRANT ALL ON public.guest_photos TO service_role;

CREATE POLICY "Admins can manage guest photos"
  ON public.guest_photos
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can read guest photo objects" ON storage.objects;
CREATE POLICY "Admins can read guest photo objects"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'guest-photos' AND public.is_admin());

CREATE POLICY "Admins can upload guest photo objects"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'guest-photos' AND public.is_admin());

CREATE POLICY "Admins can update guest photo objects"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'guest-photos' AND public.is_admin())
  WITH CHECK (bucket_id = 'guest-photos' AND public.is_admin());

CREATE POLICY "Admins can delete guest photo objects"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'guest-photos' AND public.is_admin());
