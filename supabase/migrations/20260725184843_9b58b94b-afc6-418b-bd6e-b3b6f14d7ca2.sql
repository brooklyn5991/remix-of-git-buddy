DROP POLICY IF EXISTS "Only backend service can manage admin settings" ON public.admin_settings;
CREATE POLICY "Only backend service can manage admin settings"
ON public.admin_settings
FOR ALL
TO service_role
USING ((auth.jwt() ->> 'role') = 'service_role')
WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');