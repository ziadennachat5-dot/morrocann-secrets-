ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS special_occasion text
    CHECK (special_occasion IS NULL OR char_length(special_occasion) <= 80);
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS private_group boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "Public can insert bookings" ON public.bookings;
REVOKE INSERT ON public.bookings FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.booking_rate_limits (
  ip_hash text PRIMARY KEY CHECK (char_length(ip_hash) = 64),
  window_started_at timestamptz NOT NULL,
  request_count integer NOT NULL CHECK (request_count > 0)
);

ALTER TABLE public.booking_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.booking_rate_limits FROM anon, authenticated;
GRANT ALL ON public.booking_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.consume_booking_rate_limit(p_ip_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_started_at timestamptz;
  v_count integer;
BEGIN
  IF p_ip_hash IS NULL OR p_ip_hash !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'Invalid rate limit key';
  END IF;

  INSERT INTO public.booking_rate_limits (ip_hash, window_started_at, request_count)
  VALUES (p_ip_hash, now(), 1)
  ON CONFLICT (ip_hash) DO NOTHING;

  SELECT window_started_at, request_count
  INTO v_started_at, v_count
  FROM public.booking_rate_limits
  WHERE ip_hash = p_ip_hash
  FOR UPDATE;

  IF v_started_at < now() - interval '10 minutes' THEN
    UPDATE public.booking_rate_limits
    SET window_started_at = now(), request_count = 1
    WHERE ip_hash = p_ip_hash;
    RETURN true;
  END IF;

  IF v_count >= 5 THEN
    RETURN false;
  END IF;

  UPDATE public.booking_rate_limits
  SET request_count = request_count + 1
  WHERE ip_hash = p_ip_hash;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_booking_rate_limit(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_booking_rate_limit(text) TO service_role;

DROP FUNCTION IF EXISTS public.book_experience_atomic(
  text, text, text, text, date, integer, text, text, text, text, numeric
);

CREATE OR REPLACE FUNCTION public.book_experience_atomic(
  p_name text,
  p_email text,
  p_phone text,
  p_experience_id text,
  p_date date,
  p_guests integer,
  p_dietary_needs text DEFAULT NULL,
  p_message text DEFAULT NULL,
  p_language text DEFAULT 'en',
  p_payment_method text DEFAULT 'arrival',
  p_deposit_paid numeric DEFAULT 0,
  p_special_occasion text DEFAULT NULL,
  p_private_group boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slot public.availability%ROWTYPE;
  v_exp public.experiences%ROWTYPE;
  v_total_price numeric(10, 2);
  v_booking_id uuid;
  v_new_booked integer;
BEGIN
  IF p_guests < 1 OR p_guests > 12 THEN
    RAISE EXCEPTION 'Guests must be between 1 and 12';
  END IF;
  IF p_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Booking date must be today or in the future';
  END IF;
  IF p_email IS NULL OR p_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email address provided';
  END IF;
  IF p_name IS NULL OR char_length(trim(p_name)) < 2 OR char_length(p_name) > 100 THEN
    RAISE EXCEPTION 'Name must be between 2 and 100 characters';
  END IF;
  IF p_phone IS NULL OR char_length(p_phone) > 30 THEN
    RAISE EXCEPTION 'Invalid phone number provided';
  END IF;
  IF p_language NOT IN ('en', 'fr', 'ar') THEN
    RAISE EXCEPTION 'Unsupported language';
  END IF;
  IF p_special_occasion IS NOT NULL AND char_length(p_special_occasion) > 80 THEN
    RAISE EXCEPTION 'Special occasion is too long';
  END IF;
  IF p_private_group AND p_guests < 6 THEN
    RAISE EXCEPTION 'Private groups require at least 6 guests';
  END IF;

  SELECT * INTO v_exp
  FROM public.experiences
  WHERE id = p_experience_id AND is_published = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Experience is unavailable';
  END IF;
  IF p_guests > v_exp.max_guests THEN
    RAISE EXCEPTION 'Guest count exceeds the experience limit';
  END IF;

  SELECT * INTO v_slot
  FROM public.availability
  WHERE date = p_date AND experience_id = p_experience_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'This date is not open for booking';
  END IF;
  IF v_slot.status <> 'available' OR (v_slot.capacity - v_slot.booked_count) < p_guests THEN
    RAISE EXCEPTION 'This date does not have enough available places';
  END IF;

  v_total_price := v_exp.price * p_guests;
  INSERT INTO public.bookings (
    name, email, phone, experience_id, date, guests, dietary_needs,
    message, language, status, payment_method, deposit_paid, total_price,
    special_occasion, private_group
  ) VALUES (
    trim(p_name), lower(trim(p_email)), trim(p_phone), p_experience_id, p_date,
    p_guests, nullif(trim(p_dietary_needs), ''), nullif(trim(p_message), ''),
    p_language, 'pending', p_payment_method, COALESCE(p_deposit_paid, 0),
    v_total_price, nullif(trim(p_special_occasion), ''), p_private_group
  ) RETURNING id INTO v_booking_id;

  v_new_booked := v_slot.booked_count + p_guests;
  UPDATE public.availability
  SET booked_count = v_new_booked,
      status = CASE WHEN v_new_booked >= capacity THEN 'booked' ELSE 'available' END,
      updated_at = now()
  WHERE id = v_slot.id;

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'experience_id', p_experience_id,
    'experience_title', v_exp.title,
    'date', p_date,
    'guests', p_guests,
    'total_price', v_total_price,
    'status', 'pending',
    'created_at', now()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.book_experience_atomic(
  text, text, text, text, date, integer, text, text, text, text, numeric, text, boolean
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.book_experience_atomic(
  text, text, text, text, date, integer, text, text, text, text, numeric, text, boolean
) TO service_role;

COMMENT ON TABLE public.booking_rate_limits IS
  'Server-only hashed-IP rate-limit counters for public booking requests.';
