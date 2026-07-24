CREATE UNIQUE INDEX IF NOT EXISTS reservations_payment_reference_unique_idx
ON public.reservations (payment_reference)
WHERE payment_reference IS NOT NULL;
