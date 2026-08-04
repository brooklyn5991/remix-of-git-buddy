CREATE OR REPLACE FUNCTION public.auto_checkout_past_reservations()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  updated_count integer := 0;
  cancelled_count integer := 0;
  lagos_now timestamp := (now() AT TIME ZONE 'Africa/Lagos');
BEGIN
  UPDATE public.reservations
  SET status = 'checked_out'
  WHERE status IN ('confirmed', 'checked_in')
    AND (
      check_out < lagos_now::date
      OR (check_out = lagos_now::date AND lagos_now::time >= TIME '14:00')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;

  UPDATE public.reservations
  SET status = 'cancelled', payment_status = 'failed'
  WHERE source = 'online'
    AND status = 'pending'
    AND payment_status = 'pending'
    AND created_at < now() - interval '30 minutes';
  GET DIAGNOSTICS cancelled_count = ROW_COUNT;

  RETURN updated_count + cancelled_count;
END;
$function$;