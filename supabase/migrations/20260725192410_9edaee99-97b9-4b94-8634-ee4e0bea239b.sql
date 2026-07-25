INSERT INTO public.admin_settings (key, value)
VALUES
  ('admin_username', 'adminhotel'),
  ('admin_password_sha256', '54378d2996583d4eaf5c34e6e5fcb49afdf660964463af254068fe60ad29ab3f')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = now();