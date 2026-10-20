ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en'
    CHECK (language IN ('en', 'fr', 'ar'));

CREATE UNIQUE INDEX IF NOT EXISTS reviews_booking_id_unique
  ON public.reviews (booking_id)
  WHERE booking_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.booking_email_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (
    kind IN ('booking_received', 'booking_confirmed', 'booking_reminder', 'booking_cancelled', 'review_request')
  ),
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'sent', 'logged', 'failed')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id, kind)
);

ALTER TABLE public.booking_email_jobs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.booking_email_jobs FROM anon, authenticated;
GRANT SELECT ON public.booking_email_jobs TO authenticated;
GRANT ALL ON public.booking_email_jobs TO service_role;

CREATE POLICY "Admins can view booking email jobs"
  ON public.booking_email_jobs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.queue_booking_emails()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.booking_email_jobs (booking_id, kind, scheduled_at)
    VALUES
      (NEW.id, 'booking_received', now()),
      (
        NEW.id,
        'booking_reminder',
        GREATEST(
          (NEW.date::timestamp AT TIME ZONE 'Africa/Casablanca') - interval '48 hours',
          now()
        )
      ),
      (
        NEW.id,
        'review_request',
        GREATEST(
          ((NEW.date + 1)::timestamp AT TIME ZONE 'Africa/Casablanca') + interval '9 hours',
          now()
        )
      )
    ON CONFLICT (booking_id, kind) DO NOTHING;
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'confirmed' THEN
      INSERT INTO public.booking_email_jobs (booking_id, kind, scheduled_at)
      VALUES (NEW.id, 'booking_confirmed', now())
      ON CONFLICT (booking_id, kind) DO NOTHING;
    ELSIF NEW.status = 'cancelled' THEN
      INSERT INTO public.booking_email_jobs (booking_id, kind, scheduled_at)
      VALUES (NEW.id, 'booking_cancelled', now())
      ON CONFLICT (booking_id, kind) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS booking_email_jobs_on_insert ON public.bookings;
CREATE TRIGGER booking_email_jobs_on_insert
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.queue_booking_emails();

DROP TRIGGER IF EXISTS booking_email_jobs_on_status_change ON public.bookings;
CREATE TRIGGER booking_email_jobs_on_status_change
  AFTER UPDATE OF status ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.queue_booking_emails();

CREATE OR REPLACE FUNCTION public.claim_booking_email_jobs(p_batch_size integer DEFAULT 10)
RETURNS SETOF public.booking_email_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Service role required';
  END IF;

  RETURN QUERY
  WITH due AS (
    SELECT id
    FROM public.booking_email_jobs
    WHERE scheduled_at <= now()
      AND attempts < 5
      AND (
        status IN ('pending', 'failed')
        OR (status = 'processing' AND updated_at < now() - interval '10 minutes')
      )
    ORDER BY scheduled_at, created_at
    FOR UPDATE SKIP LOCKED
    LIMIT LEAST(GREATEST(COALESCE(p_batch_size, 10), 1), 50)
  )
  UPDATE public.booking_email_jobs AS jobs
  SET status = 'processing',
      attempts = jobs.attempts + 1,
      updated_at = now()
  FROM due
  WHERE jobs.id = due.id
  RETURNING jobs.*;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_booking_email_jobs(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_booking_email_jobs(integer) TO service_role;

COMMENT ON TABLE public.booking_email_jobs IS
  'Transactional booking email outbox; delivery is processed by the authenticated cron endpoint.';
