DROP POLICY IF EXISTS "Service role can manage admin settings" ON public.admin_settings;

REVOKE ALL ON public.admin_settings FROM anon;
REVOKE ALL ON public.admin_settings FROM authenticated;
GRANT ALL ON public.admin_settings TO service_role;