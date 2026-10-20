ALTER TABLE public.experiences
  ALTER COLUMN is_published SET DEFAULT false;

ALTER TABLE public.host_families
  ALTER COLUMN is_published SET DEFAULT false;
