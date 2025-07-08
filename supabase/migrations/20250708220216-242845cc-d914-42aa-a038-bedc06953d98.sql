-- Clear existing troop_types and add only the specified troops
DELETE FROM public.troop_types;
DELETE FROM public.counter_advice;

-- Insert the exact troops you specified (removing duplicates)
INSERT INTO public.troop_types (id, name, description, trait_family) VALUES
(1, 'Archers', 'Ranged attackers', 'Human'),
(2, 'Golden Knight', 'Elite warrior', 'Human'),
(3, 'Royal Ghost', 'Stealth unit', 'Undead'),
(4, 'Goblin Machine', 'Mechanical unit', 'Goblin'),
(5, 'Goblins', 'Fast attackers', 'Goblin'),
(6, 'Princess', 'Long range archer', 'Human'),
(7, 'Barbarians', 'Fierce warriors', 'Human'),
(8, 'Valkyrie', 'Area damage', 'Human'),
(9, 'Dart Goblin', 'Ranged goblin', 'Goblin'),
(10, 'Spear Goblins', 'Spear wielders', 'Goblin'),
(11, 'P.E.K.K.A', 'Heavy armor', 'Robot'),
(12, 'Knight', 'Tank unit', 'Human'),
(13, 'Mega Knight', 'Super tank', 'Human'),
(14, 'Skeleton King', 'Undead ruler', 'Undead'),
(15, 'Giant Skeleton', 'Bomb carrier', 'Undead'),
(16, 'Archer Queen', 'Elite archer', 'Human'),
(17, 'Bomber', 'Explosion expert', 'Goblin'),
(18, 'Executioner', 'Axe thrower', 'Human'),
(19, 'Bandit', 'Fast attacker', 'Human');