-- =============================================================================
-- MOROCCAN SECRETS - Core Database Schema & Row-Level Security
-- =============================================================================

-- Enable pgcrypto for UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. ADMIN USERS TABLE
-- -----------------------------------------------------------------------------
-- Only users listed in this table hold administrative privileges.
-- Public cannot read or write to this table.
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper security-definer function to verify admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
  );
$$;

-- RLS for admin_users: Only confirmed admins can view admin listings
CREATE POLICY "Admins can view admin_users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Superadmins can manage admin_users"
  ON public.admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- -----------------------------------------------------------------------------
-- 2. EXPERIENCES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.experiences (
  id text PRIMARY KEY, -- slug identifier (e.g., 'family-dinner', 'cook-and-dine')
  title jsonb NOT NULL, -- {"en": "...", "fr": "...", "ar": "..."}
  blurb jsonb NOT NULL,
  duration jsonb NOT NULL,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  deposit_amount numeric(10, 2) NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
  max_guests integer NOT NULL CHECK (max_guests BETWEEN 1 AND 25),
  image_url text NOT NULL,
  included jsonb NOT NULL DEFAULT '[]'::jsonb, -- array of {"en": "", "fr": "", "ar": ""}
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

-- Public can read published experiences; admins can read all
CREATE POLICY "Public can view published experiences"
  ON public.experiences
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true OR public.is_admin());

-- Only admins can modify experiences
CREATE POLICY "Admins can insert experiences"
  ON public.experiences
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update experiences"
  ON public.experiences
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete experiences"
  ON public.experiences
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 3. HOST FAMILIES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.host_families (
  id text PRIMARY KEY, -- slug identifier (e.g., 'amrani', 'benali', 'idrissi')
  name jsonb NOT NULL,
  area jsonb NOT NULL,
  languages jsonb NOT NULL,
  signature_dish jsonb NOT NULL,
  story jsonb NOT NULL,
  address text, -- Private address sent upon booking confirmation
  image_url text NOT NULL,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.host_families ENABLE ROW LEVEL SECURITY;

-- Public can read published host families; admins can read all
CREATE POLICY "Public can view published host families"
  ON public.host_families
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true OR public.is_admin());

-- Only admins can manage host families
CREATE POLICY "Admins can insert host families"
  ON public.host_families
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update host families"
  ON public.host_families
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete host families"
  ON public.host_families
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 4. AVAILABILITY TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  experience_id text NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  capacity integer NOT NULL CHECK (capacity > 0),
  booked_count integer NOT NULL DEFAULT 0 CHECK (booked_count >= 0 AND booked_count <= capacity),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(date, experience_id)
);

ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- Public can view active availability slots
CREATE POLICY "Public can view active availability slots"
  ON public.availability
  FOR SELECT
  TO anon, authenticated
  USING (status != 'closed' OR public.is_admin());

-- Only authenticated admins can manage availability manually
CREATE POLICY "Admins can manage availability"
  ON public.availability
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 5. BOOKINGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  email text NOT NULL CHECK (char_length(email) <= 255),
  phone text NOT NULL CHECK (char_length(phone) <= 30),
  experience_id text NOT NULL REFERENCES public.experiences(id) ON DELETE RESTRICT,
  date date NOT NULL,
  guests integer NOT NULL CHECK (guests BETWEEN 1 AND 12),
  dietary_needs text CHECK (char_length(dietary_needs) <= 500),
  message text CHECK (char_length(message) <= 1000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  payment_method text NOT NULL DEFAULT 'arrival' CHECK (payment_method IN ('arrival', 'deposit', 'card')),
  deposit_paid numeric(10, 2) NOT NULL DEFAULT 0 CHECK (deposit_paid >= 0),
  total_price numeric(10, 2) NOT NULL DEFAULT 0 CHECK (total_price >= 0),
  language text NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'fr', 'ar')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Requirement: Public CANNOT select bookings (protects customer privacy and PII)
-- Only admins can select, update or delete bookings
CREATE POLICY "Admins can view bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Public can insert bookings"
  ON public.bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending' AND
    guests BETWEEN 1 AND 12 AND
    date >= CURRENT_DATE
  );

CREATE POLICY "Admins can update bookings"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete bookings"
  ON public.bookings
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 6. REVIEWS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id text REFERENCES public.experiences(id) ON DELETE SET NULL,
  author text NOT NULL CHECK (char_length(author) BETWEEN 2 AND 80),
  origin text NOT NULL CHECK (char_length(origin) <= 100),
  quote jsonb NOT NULL, -- {"en": "...", "fr": "...", "ar": "..."}
  rating integer NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  approved boolean NOT NULL DEFAULT false, -- Defaults to unapproved
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public can read approved reviews only; Admins can see all
CREATE POLICY "Public can view approved reviews"
  ON public.reviews
  FOR SELECT
  TO anon, authenticated
  USING (approved = true OR public.is_admin());

-- Public can submit reviews, but approved MUST be false
CREATE POLICY "Public can insert pending reviews only"
  ON public.reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (approved = false);

-- Only admins can approve or modify reviews
CREATE POLICY "Admins can update reviews"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete reviews"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 7. ATOMIC CAPACITY CHECK & BOOKING FUNCTION
-- -----------------------------------------------------------------------------
-- Requirement: The capacity check and booking must be a single atomic Postgres function.
-- booked_count can only be changed by this SECURITY DEFINER function or service_role.
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
  p_deposit_paid numeric DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slot record;
  v_exp record;
  v_total_price numeric(10, 2);
  v_booking_id uuid;
  v_new_booked integer;
BEGIN
  -- 1. Input validations
  IF p_guests < 1 OR p_guests > 12 THEN
    RAISE EXCEPTION 'Guests must be between 1 and 12';
  END IF;

  IF p_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Booking date must be today or in the future';
  END IF;

  IF p_email IS NULL OR p_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email address provided';
  END IF;

  IF char_length(p_name) < 2 OR char_length(p_name) > 100 THEN
    RAISE EXCEPTION 'Name must be between 2 and 100 characters';
  END IF;

  -- 2. Verify experience exists and is published
  SELECT * INTO v_exp
  FROM public.experiences
  WHERE id = p_experience_id AND is_published = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Experience % is unavailable or not found', p_experience_id;
  END IF;

  -- 3. Row-level locking on availability slot for atomicity
  SELECT * INTO v_slot
  FROM public.availability
  WHERE date = p_date AND experience_id = p_experience_id
  FOR UPDATE;

  -- If no specific slot entry exists yet, initialize one with experience's default max_guests
  IF NOT FOUND THEN
    INSERT INTO public.availability (date, experience_id, capacity, booked_count, status)
    VALUES (p_date, p_experience_id, v_exp.max_guests, 0, 'available')
    ON CONFLICT (date, experience_id) DO UPDATE SET updated_at = now()
    RETURNING * INTO v_slot;

    -- Re-select with row-level lock
    SELECT * INTO v_slot
    FROM public.availability
    WHERE date = p_date AND experience_id = p_experience_id
    FOR UPDATE;
  END IF;

  -- 4. Check status and capacity
  IF v_slot.status = 'closed' THEN
    RAISE EXCEPTION 'This date is currently closed for bookings';
  END IF;

  IF (v_slot.capacity - v_slot.booked_count) < p_guests THEN
    RAISE EXCEPTION 'Not enough spots available for this date. Remaining spots: %', (v_slot.capacity - v_slot.booked_count);
  END IF;

  -- 5. Calculate total price
  v_total_price := v_exp.price * p_guests;

  -- 6. Insert booking record
  INSERT INTO public.bookings (
    name, email, phone, experience_id, date, guests,
    dietary_needs, message, language, status,
    payment_method, deposit_paid, total_price
  ) VALUES (
    p_name, p_email, p_phone, p_experience_id, p_date, p_guests,
    p_dietary_needs, p_message, p_language, 'pending',
    p_payment_method, COALESCE(p_deposit_paid, 0), v_total_price
  ) RETURNING id INTO v_booking_id;

  -- 7. Update availability atomically
  v_new_booked := v_slot.booked_count + p_guests;
  UPDATE public.availability
  SET booked_count = v_new_booked,
      status = CASE WHEN v_new_booked >= capacity THEN 'booked' ELSE 'available' END,
      updated_at = now()
  WHERE id = v_slot.id;

  -- 8. Return response object (without exposing other bookings)
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

-- Grant execution to public so users can book through this atomic function
GRANT EXECUTE ON FUNCTION public.book_experience_atomic TO anon, authenticated;

-- Revoke direct permissions on availability table update for anon & regular users
REVOKE UPDATE, DELETE ON public.availability FROM anon, authenticated;
