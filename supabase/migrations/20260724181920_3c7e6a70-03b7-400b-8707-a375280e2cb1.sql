UPDATE public.reservations
SET status = 'cancelled', payment_status = 'failed'
WHERE source = 'online'
  AND status = 'pending'
  AND payment_status = 'pending';

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT c.conname INTO constraint_name
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  WHERE n.nspname = 'public'
    AND t.relname = 'reservations'
    AND c.contype = 'x'
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.reservations DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE public.reservations
ADD CONSTRAINT reservations_no_overlap_confirmed_rooms
EXCLUDE USING gist (
  room_id WITH =,
  daterange(check_in, check_out, '[)') WITH &&
) WHERE (status IN ('confirmed','checked_in'));
