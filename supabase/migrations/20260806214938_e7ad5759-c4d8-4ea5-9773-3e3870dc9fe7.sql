ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'paystack';
UPDATE public.reservations SET payment_method = 'paystack' WHERE source = 'online';
UPDATE public.reservations SET payment_method = 'cash' WHERE source = 'walk_in';
ALTER TABLE public.reservations ADD CONSTRAINT reservations_payment_method_check CHECK (payment_method IN ('paystack','cash','pos'));