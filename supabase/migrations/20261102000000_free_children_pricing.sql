-- Make children and infants (ages 1 to 11) completely free
UPDATE public.experiences
SET child_price = 0,
    child_age_min = 1,
    child_age_max = 11,
    updated_at = now();
