-- Seed data for unit tables in bike parts tracker
-- This file adds the supported units that correspond to the profileUtils.ts constants

-- Insert currency units
INSERT INTO public.currency_unit (unit) VALUES 
  ('USD'),
  ('EUR'),
  ('GBP'),
  ('CHF'),
  ('CAD'),
  ('AUD'),
  ('JPY'),
  ('NZD'),
  ('INR'),
  ('ZAR'),
  ('SGD'),
  ('HKD')
ON CONFLICT (unit) DO NOTHING;

-- Insert weight units  
INSERT INTO public.weight_unit (unit) VALUES 
  ('kg'),
  ('lbs'),
  ('g')
ON CONFLICT (unit) DO NOTHING;

-- Insert distance units
INSERT INTO public.distance_unit (unit) VALUES 
  ('km'),
  ('mi')
ON CONFLICT (unit) DO NOTHING;
