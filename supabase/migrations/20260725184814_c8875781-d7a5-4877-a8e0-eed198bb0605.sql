CREATE TABLE IF NOT EXISTS public.admin_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.admin_settings TO service_role;

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage admin settings" ON public.admin_settings;
CREATE POLICY "Service role can manage admin settings"
ON public.admin_settings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.touch_admin_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS touch_admin_settings_updated_at ON public.admin_settings;
CREATE TRIGGER touch_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.touch_admin_settings_updated_at();

INSERT INTO public.admin_settings (key, value)
VALUES
  ('admin_username', 'adminhotel'),
  ('admin_password_sha256', 'ba422ee0f88016da233329a5c4676a45b866e7f1077f0680a657e7ea7a0ccf95')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;