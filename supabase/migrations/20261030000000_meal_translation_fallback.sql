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
      WHERE COALESCE(
        NULLIF(trim(meal_option.value ->> p_language), ''),
        meal_option.value ->> 'en'
      ) = p_meal_choice
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
