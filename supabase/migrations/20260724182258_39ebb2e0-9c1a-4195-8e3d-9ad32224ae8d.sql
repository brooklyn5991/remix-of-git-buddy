UPDATE public.reservations
SET status = 'cancelled', payment_status = 'failed'
WHERE source = 'online'
  AND status = 'confirmed'
  AND payment_status = 'pending';
