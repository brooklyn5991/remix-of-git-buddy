-- 1. Remove blanket anon read/update on reservations (server functions use service role)
DROP POLICY IF EXISTS "Anon can read reservations" ON public.reservations;
DROP POLICY IF EXISTS "Anon can settle payment" ON public.reservations;
DROP POLICY IF EXISTS "Anon can create online booking" ON public.reservations;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.reservations FROM anon;
GRANT ALL ON public.reservations TO service_role;

-- 2. Replace always-true complaint insert checks with validated constraints
DROP POLICY IF EXISTS "Anon submit complaints" ON public.complaints;
DROP POLICY IF EXISTS "Staff submit complaints" ON public.complaints;

CREATE POLICY "Anon submit complaints"
  ON public.complaints FOR INSERT TO anon
  WITH CHECK (
    is_read = false
    AND char_length(guest_name) BETWEEN 2 AND 120
    AND char_length(guest_contact) BETWEEN 3 AND 120
    AND char_length(subject) BETWEEN 2 AND 140
    AND char_length(message) BETWEEN 5 AND 4000
  );

CREATE POLICY "Staff submit complaints"
  ON public.complaints FOR INSERT TO authenticated
  WITH CHECK (
    is_read = false
    AND char_length(guest_name) BETWEEN 2 AND 120
    AND char_length(guest_contact) BETWEEN 3 AND 120
    AND char_length(subject) BETWEEN 2 AND 140
    AND char_length(message) BETWEEN 5 AND 4000
  );

-- 3. Lock down SECURITY DEFINER functions to the backend service only
REVOKE ALL ON FUNCTION public.get_backend_secret(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_backend_secret(text) TO service_role;

REVOKE ALL ON FUNCTION public.auto_checkout_past_reservations() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auto_checkout_past_reservations() TO service_role;

-- has_role stays executable by authenticated: it backs RLS policy evaluation
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;