-- Add some sample counter advice for Bronze league to test the system
INSERT INTO public.counter_advice (league_id, troop_id, usage_count, usage_percentage, rank)
VALUES 
(1, 12, 5, 12.5, 1),  -- Knight
(1, 1, 3, 7.5, 2),    -- Archers  
(1, 5, 2, 5.0, 3)     -- Goblins
ON CONFLICT (league_id, troop_id) DO NOTHING;