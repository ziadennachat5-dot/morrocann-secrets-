CREATE TABLE IF NOT EXISTS public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (email = lower(email) AND char_length(email) <= 255),
  language text NOT NULL CHECK (language IN ('en', 'fr', 'ar')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  confirmation_token_hash text UNIQUE,
  confirmation_expires_at timestamptz,
  consented_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (status = 'pending' AND confirmation_token_hash IS NOT NULL AND confirmation_expires_at IS NOT NULL)
    OR (status != 'pending' AND confirmation_token_hash IS NULL AND confirmation_expires_at IS NULL)
  )
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.subscribers FROM anon, authenticated;
GRANT SELECT ON public.subscribers TO authenticated;
GRANT ALL ON public.subscribers TO service_role;

CREATE POLICY "Admins can read newsletter subscribers"
  ON public.subscribers
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

COMMENT ON TABLE public.subscribers IS
  'Newsletter recipients remain pending until they confirm their email address; only admins can read subscriber records.';
