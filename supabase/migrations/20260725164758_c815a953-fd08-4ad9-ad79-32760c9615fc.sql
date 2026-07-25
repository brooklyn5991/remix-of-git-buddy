
CREATE OR REPLACE FUNCTION public.auto_checkout_past_reservations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.reservations
  SET status = 'checked_out'
  WHERE status IN ('confirmed', 'checked_in')
    AND check_out <= CURRENT_DATE;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.auto_checkout_past_reservations() TO anon, authenticated, service_role;

SELECT public.auto_checkout_past_reservations();
