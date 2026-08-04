REVOKE ALL ON FUNCTION public.auto_checkout_past_reservations() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auto_checkout_past_reservations() TO service_role;