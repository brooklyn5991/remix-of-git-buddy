UPDATE public.rooms SET features = '["Queen orthopedic mattress","Split-unit air conditioning","En-suite bathroom with hot water","High-speed fiber Wi-Fi","Complimentary breakfast"]'::jsonb WHERE tier = 'Standard';

UPDATE public.rooms SET features = '["King orthopedic mattress","Single sofa chair & accent table","Split-unit air conditioning","En-suite bathroom with hot water","Executive desk & ergonomic chair","Complimentary breakfast"]'::jsonb WHERE tier = 'Deluxe';

UPDATE public.rooms SET features = '["King orthopedic mattress","Single sofa chair & accent table","Smart TV with DSTV / satellite","Split-unit air conditioning","En-suite bathroom with hot water","Executive desk & ergonomic chair","Complimentary breakfast"]'::jsonb WHERE tier = 'Executive';

UPDATE public.rooms SET features = '["King orthopedic mattress","Smart TV with DSTV / satellite","Split-unit air conditioning","En-suite bathroom with hot water","Executive desk & ergonomic chair","Priority check-in & turndown service","Complimentary breakfast"]'::jsonb WHERE tier = 'Suite';