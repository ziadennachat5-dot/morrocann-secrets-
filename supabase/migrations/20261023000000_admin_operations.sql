CREATE TABLE IF NOT EXISTS public.booking_internal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT DEFAULT auth.uid(),
  note text NOT NULL CHECK (char_length(note) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_internal_notes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.booking_internal_notes FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.booking_internal_notes TO authenticated;
GRANT ALL ON public.booking_internal_notes TO service_role;

CREATE POLICY "Admins can manage booking internal notes"
  ON public.booking_internal_notes
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.booking_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT DEFAULT auth.uid(),
  channel text NOT NULL CHECK (channel IN ('email', 'whatsapp', 'phone', 'other')),
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.booking_messages FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.booking_messages TO authenticated;
GRANT ALL ON public.booking_messages TO service_role;

CREATE POLICY "Admins can manage booking messages"
  ON public.booking_messages
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

COMMENT ON TABLE public.booking_internal_notes IS
  'Private operational notes attached to bookings; admin-only under RLS.';
COMMENT ON TABLE public.booking_messages IS
  'Manually logged guest communication history; admin-only under RLS.';

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
    WHERE date = v_booking.date
      AND experience_id = v_booking.experience_id
    FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Booking availability slot not found';
    END IF;

    IF p_status = 'cancelled' THEN
      v_new_booked := v_slot.booked_count - v_booking.guests;
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
        OR v_slot.capacity - v_slot.booked_count < v_booking.guests THEN
        RAISE EXCEPTION 'Availability no longer has enough capacity';
      END IF;
      v_new_booked := v_slot.booked_count + v_booking.guests;
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
