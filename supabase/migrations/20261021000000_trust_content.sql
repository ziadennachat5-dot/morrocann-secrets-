CREATE TABLE IF NOT EXISTS public.site_settings (
  setting_key text PRIMARY KEY CHECK (char_length(setting_key) BETWEEN 1 AND 100),
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_public boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.site_settings FROM anon, authenticated;
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

CREATE POLICY "Public can read public site settings"
  ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (is_public OR public.is_admin());

CREATE POLICY "Admins can insert site settings"
  ON public.site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update site settings"
  ON public.site_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete site settings"
  ON public.site_settings
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

COMMENT ON TABLE public.site_settings IS
  'Admin-managed multilingual site content; only explicitly public settings are visible to visitors.';

UPDATE public.experiences
SET is_published = false, updated_at = now()
WHERE (id, title->>'en') IN (
  ('family-dinner', 'Family Dinner Evening'),
  ('cook-and-dine', 'Cook & Dine Workshop'),
  ('friday-couscous', 'Friday Couscous Lunch')
);

UPDATE public.host_families
SET is_published = false, updated_at = now()
WHERE (id, name->>'en') IN (
  ('amrani', 'The Amrani Family'),
  ('benali', 'Lalla Fatima & daughters'),
  ('idrissi', 'The Idrissi Brothers')
);

UPDATE public.reviews
SET approved = false
WHERE (author = 'Sarah & Tom' AND origin = 'London'
       AND quote->>'en' = 'The highlight of our whole trip. We came as tourists and left with an invitation to come back for Eid.')
   OR (author = 'Julien' AND origin = 'Lyon'
       AND quote->>'en' = 'Khadija''s tagine ruined every restaurant for me.')
   OR (author = 'Maria' AND origin = 'Madrid'
       AND quote->>'en' = 'Warm, unhurried and real. My kids still talk about rolling couscous.');

UPDATE public.availability
SET status = 'closed', updated_at = now()
WHERE experience_id IN ('family-dinner', 'cook-and-dine', 'friday-couscous')
  AND booked_count = 0
  AND status = 'available';
