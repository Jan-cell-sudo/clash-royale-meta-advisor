-- Add Prince troop to troop_types table
INSERT INTO public.troop_types (id, name, trait_family, description)
VALUES (25, 'Prince', 'Ground', 'A fast charging melee troop that deals double damage on his first attack')
ON CONFLICT (id) DO NOTHING;