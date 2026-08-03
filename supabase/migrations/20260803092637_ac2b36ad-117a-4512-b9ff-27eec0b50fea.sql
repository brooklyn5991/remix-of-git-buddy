
UPDATE public.rooms SET room_number = 'tmp-' || room_number;

WITH nums AS (
  SELECT 'Standard'::text AS tier, n, rn FROM unnest(ARRAY['2006','2007']) WITH ORDINALITY AS t(n, rn)
  UNION ALL SELECT 'Deluxe', n, rn FROM unnest(ARRAY['2005','2008']) WITH ORDINALITY AS t(n, rn)
  UNION ALL SELECT 'Suite', n, rn FROM unnest(ARRAY['2000']) WITH ORDINALITY AS t(n, rn)
  UNION ALL SELECT 'Executive', n, rn FROM unnest(ARRAY['1000','1001','1002','1003','1004','1005','1006','1007','2001','2002','2003','2004','2009','2010','2011','2012']) WITH ORDINALITY AS t(n, rn)
), ranked AS (
  SELECT id, tier, row_number() OVER (PARTITION BY tier ORDER BY length(room_number), room_number) AS rn FROM public.rooms
)
UPDATE public.rooms r
SET room_number = nums.n
FROM ranked JOIN nums ON nums.tier = ranked.tier AND nums.rn = ranked.rn
WHERE r.id = ranked.id;
