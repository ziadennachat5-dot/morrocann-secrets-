ALTER TABLE public.experiences
  ADD COLUMN child_price numeric(10, 2) CHECK (child_price IS NULL OR child_price >= 0),
  ADD COLUMN child_age_min integer,
  ADD COLUMN child_age_max integer,
  ADD COLUMN min_guests integer,
  ADD COLUMN start_time time,
  ADD COLUMN meal_options jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN why_love jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN what_to_expect jsonb,
  ADD COLUMN what_to_remember jsonb,
  ADD COLUMN host_languages jsonb,
  ADD CONSTRAINT experiences_guest_range_check
    CHECK (min_guests IS NULL OR min_guests BETWEEN 1 AND max_guests),
  ADD CONSTRAINT experiences_child_age_range_check
    CHECK (
      (child_price IS NULL AND child_age_min IS NULL AND child_age_max IS NULL)
      OR (
        child_price IS NOT NULL
        AND child_age_min IS NOT NULL
        AND child_age_max IS NOT NULL
        AND child_age_min BETWEEN 1 AND child_age_max
        AND child_age_max <= 120
      )
    ),
  ADD CONSTRAINT experiences_meal_options_array_check
    CHECK (jsonb_typeof(meal_options) = 'array'),
  ADD CONSTRAINT experiences_why_love_array_check
    CHECK (jsonb_typeof(why_love) = 'array');

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_guests_check,
  ADD COLUMN adults integer,
  ADD COLUMN children integer,
  ADD COLUMN infants integer,
  ADD COLUMN adult_unit_price numeric(10, 2),
  ADD COLUMN child_unit_price numeric(10, 2),
  ADD COLUMN meal_choice text,
  ADD COLUMN start_time time;

UPDATE public.bookings AS booking
SET adults = booking.guests,
    children = 0,
    infants = 0,
    adult_unit_price = experience.price,
    child_unit_price = experience.child_price,
    start_time = experience.start_time
FROM public.experiences AS experience
WHERE experience.id = booking.experience_id;

ALTER TABLE public.bookings
  ALTER COLUMN adults SET NOT NULL,
  ALTER COLUMN adults SET DEFAULT 0,
  ALTER COLUMN children SET NOT NULL,
  ALTER COLUMN children SET DEFAULT 0,
  ALTER COLUMN infants SET NOT NULL,
  ALTER COLUMN infants SET DEFAULT 0,
  ALTER COLUMN adult_unit_price SET NOT NULL,
  ADD CONSTRAINT bookings_party_counts_check
    CHECK (
      adults >= 0
      AND children >= 0
      AND infants >= 0
      AND guests = adults + children + infants
      AND guests >= 1
    ),
  ADD CONSTRAINT bookings_unit_prices_check
    CHECK (
      adult_unit_price >= 0
      AND (child_unit_price IS NULL OR child_unit_price >= 0)
    );

ALTER TABLE public.site_settings
  ALTER COLUMN is_public SET DEFAULT false;

UPDATE public.site_settings
SET is_public = false, updated_at = now()
WHERE setting_key IN ('trust.meeting_point', 'booking.owner_email');

ALTER TABLE public.site_settings
  ADD CONSTRAINT site_settings_private_booking_values_check
  CHECK (
    setting_key NOT IN ('trust.meeting_point', 'booking.owner_email')
    OR is_public = false
  );

DROP FUNCTION IF EXISTS public.book_experience_atomic(
  text, text, text, text, date, integer, text, text, text, text, numeric, text, boolean
);

CREATE OR REPLACE FUNCTION public.book_experience_atomic(
  p_name text,
  p_email text,
  p_phone text,
  p_experience_id text,
  p_date date,
  p_guests integer,
  p_adults integer,
  p_children integer,
  p_infants integer,
  p_meal_choice text,
  p_dietary_needs text,
  p_message text,
  p_language text,
  p_payment_method text,
  p_deposit_paid numeric,
  p_special_occasion text,
  p_private_group boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slot public.availability%ROWTYPE;
  v_exp public.experiences%ROWTYPE;
  v_counted_guests integer;
  v_total_price numeric(10, 2);
  v_booking_id uuid;
  v_new_booked integer;
BEGIN
  IF p_adults < 0 OR p_children < 0 OR p_infants < 0
     OR p_guests <> p_adults + p_children + p_infants OR p_guests < 1 THEN
    RAISE EXCEPTION 'Invalid guest breakdown';
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

  SELECT * INTO v_exp
  FROM public.experiences
  WHERE id = p_experience_id AND is_published = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Experience is unavailable';
  END IF;
  IF v_exp.start_time IS NULL THEN
    RAISE EXCEPTION 'Experience start time is not configured';
  END IF;

  v_counted_guests := p_adults + p_children;
  IF v_exp.min_guests IS NULL
     OR v_counted_guests < v_exp.min_guests
     OR v_counted_guests > v_exp.max_guests THEN
    RAISE EXCEPTION 'Guest count is outside the experience limits';
  END IF;
  IF p_private_group AND v_counted_guests < 6 THEN
    RAISE EXCEPTION 'Private groups require at least 6 guests';
  END IF;
  IF p_children > 0 AND v_exp.child_price IS NULL THEN
    RAISE EXCEPTION 'Child pricing is not configured';
  END IF;
  IF jsonb_array_length(v_exp.meal_options) > 0 AND (
    p_meal_choice IS NULL OR NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(v_exp.meal_options) AS meal_option(value)
      WHERE meal_option.value ->> p_language = p_meal_choice
    )
  ) THEN
    RAISE EXCEPTION 'Choose one of the available meal options';
  END IF;
  IF jsonb_array_length(v_exp.meal_options) = 0 AND p_meal_choice IS NOT NULL THEN
    RAISE EXCEPTION 'Meal choices are not configured';
  END IF;

  SELECT * INTO v_slot
  FROM public.availability
  WHERE date = p_date AND experience_id = p_experience_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'This date is not open for booking';
  END IF;
  IF v_slot.status <> 'available'
     OR (v_slot.capacity - v_slot.booked_count) < v_counted_guests THEN
    RAISE EXCEPTION 'This date does not have enough available places';
  END IF;

  v_total_price := v_exp.price * p_adults
    + COALESCE(v_exp.child_price, 0) * p_children;
  INSERT INTO public.bookings (
    name, email, phone, experience_id, date, guests, adults, children, infants,
    adult_unit_price, child_unit_price, start_time, meal_choice, dietary_needs,
    message, language, status, payment_method, deposit_paid, total_price,
    special_occasion, private_group
  ) VALUES (
    trim(p_name), lower(trim(p_email)), trim(p_phone), p_experience_id, p_date,
    p_guests, p_adults, p_children, p_infants, v_exp.price, v_exp.child_price,
    v_exp.start_time, nullif(trim(p_meal_choice), ''),
    nullif(trim(p_dietary_needs), ''), nullif(trim(p_message), ''),
    p_language, 'pending', p_payment_method, COALESCE(p_deposit_paid, 0),
    v_total_price, nullif(trim(p_special_occasion), ''), p_private_group
  ) RETURNING id INTO v_booking_id;

  v_new_booked := v_slot.booked_count + v_counted_guests;
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
    'adults', p_adults,
    'children', p_children,
    'infants', p_infants,
    'start_time', v_exp.start_time,
    'total_price', v_total_price,
    'status', 'pending',
    'created_at', now()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.book_experience_atomic(
  text, text, text, text, date, integer, integer, integer, integer, text,
  text, text, text, text, numeric, text, boolean
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.book_experience_atomic(
  text, text, text, text, date, integer, integer, integer, integer, text,
  text, text, text, text, numeric, text, boolean
) TO service_role;

COMMENT ON FUNCTION public.book_experience_atomic(
  text, text, text, text, date, integer, integer, integer, integer, text,
  text, text, text, text, numeric, text, boolean
) IS 'Atomically validates adult/child capacity and saves per-category booking totals.';

CREATE OR REPLACE FUNCTION public.admin_set_booking_status(
  p_booking_id uuid,
  p_status text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking public.bookings%ROWTYPE;
  v_slot public.availability%ROWTYPE;
  v_capacity_guests integer;
  v_new_booked integer;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;
  IF p_status NOT IN ('pending', 'confirmed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid booking status';
  END IF;

  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  IF v_booking.status = p_status THEN
    RETURN true;
  END IF;

  IF (v_booking.status = 'cancelled') <> (p_status = 'cancelled') THEN
    SELECT * INTO v_slot
    FROM public.availability
    WHERE date = v_booking.date AND experience_id = v_booking.experience_id
    FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Booking availability slot not found';
    END IF;

    v_capacity_guests := v_booking.adults + v_booking.children;
    IF p_status = 'cancelled' THEN
      v_new_booked := v_slot.booked_count - v_capacity_guests;
      UPDATE public.availability
      SET booked_count = v_new_booked,
          status = CASE
            WHEN v_slot.status = 'closed' THEN 'closed'
            WHEN v_new_booked >= capacity THEN 'booked'
            ELSE 'available'
          END,
          updated_at = now()
      WHERE id = v_slot.id;
    ELSE
      IF v_slot.status = 'closed'
         OR v_slot.capacity - v_slot.booked_count < v_capacity_guests THEN
        RAISE EXCEPTION 'Availability no longer has enough capacity';
      END IF;
      v_new_booked := v_slot.booked_count + v_capacity_guests;
      UPDATE public.availability
      SET booked_count = v_new_booked,
          status = CASE WHEN v_new_booked >= capacity THEN 'booked' ELSE 'available' END,
          updated_at = now()
      WHERE id = v_slot.id;
    END IF;
  END IF;

  UPDATE public.bookings
  SET status = p_status, updated_at = now()
  WHERE id = p_booking_id;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_booking_status(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_booking_status(uuid, text) TO authenticated;
