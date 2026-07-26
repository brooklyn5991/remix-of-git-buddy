CREATE OR REPLACE FUNCTION public.get_backend_secret(secret_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  secret_value text;
BEGIN
  SELECT decrypted_secret
  INTO secret_value
  FROM vault.decrypted_secrets
  WHERE name = secret_name
  LIMIT 1;

  RETURN secret_value;
EXCEPTION
  WHEN undefined_table OR insufficient_privilege THEN
    RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.get_backend_secret(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_backend_secret(text) TO service_role;

CREATE OR REPLACE FUNCTION public.auto_checkout_past_reservations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer := 0;
  cancelled_count integer := 0;
BEGIN
  UPDATE public.reservations
  SET status = 'checked_out'
  WHERE status IN ('confirmed', 'checked_in')
    AND check_out <= CURRENT_DATE;
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
$$;

REVOKE ALL ON FUNCTION public.auto_checkout_past_reservations() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auto_checkout_past_reservations() TO service_role;

SELECT public.auto_checkout_past_reservations();