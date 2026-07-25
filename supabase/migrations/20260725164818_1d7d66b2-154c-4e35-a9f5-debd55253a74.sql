
REVOKE EXECUTE ON FUNCTION public.auto_checkout_past_reservations() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.auto_checkout_past_reservations() TO service_role;
