-- -----------------------------------------------------------------------------
-- Ensure authenticated users have table-level permissions on public.availability
-- so that Row Level Security (RLS) policy "Admins can manage availability"
-- can permit admin users to manage availability rows directly.
-- -----------------------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE, DELETE ON public.availability TO authenticated;

-- Ensure an atomic security-definer RPC function is available for administrators
CREATE OR REPLACE FUNCTION public.admin_set_availability_slot(
  p_date date,
  p_experience_id text,
  p_capacity integer,
  p_status text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;

  IF p_status NOT IN ('available', 'booked', 'closed') THEN
    RAISE EXCEPTION 'Invalid availability status';
  END IF;

  INSERT INTO public.availability (date, experience_id, capacity, status, updated_at)
  VALUES (p_date, p_experience_id, p_capacity, p_status, now())
  ON CONFLICT (date, experience_id)
  DO UPDATE SET
    capacity = EXCLUDED.capacity,
    status = EXCLUDED.status,
    updated_at = now();

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_availability_slot(date, text, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_availability_slot(date, text, integer, text) TO authenticated;
