-- Create a simple mock data approach without foreign key dependencies
-- First, let's insert data directly into the materialized view approach
-- We'll add sample data that simulates realistic usage patterns

-- Insert demo uploads with NULL user_id (for anonymous/demo data)
ALTER TABLE public.uploads ALTER COLUMN user_id DROP NOT NULL;

INSERT INTO public.uploads (user_id, filename, storage_path, league, parse_status, upload_time) VALUES
(NULL, 'demo_bronze_1.png', 'demo/bronze_1.png', 'Bronze I', 'completed', now() - interval '2 hours'),
(NULL, 'demo_bronze_2.png', 'demo/bronze_2.png', 'Bronze I', 'completed', now() - interval '1 hour'),
(NULL, 'demo_bronze_3.png', 'demo/bronze_3.png', 'Bronze I', 'completed', now() - interval '30 minutes'),
(NULL, 'demo_silver_1.png', 'demo/silver_1.png', 'Silver I', 'completed', now() - interval '1 hour'),
(NULL, 'demo_gold_1.png', 'demo/gold_1.png', 'Gold I', 'completed', now() - interval '45 minutes');

-- Now add detection data for Bronze I (creating a realistic meta)
INSERT INTO public.detections (upload_id, player_pos, player_name, troop_id, star_level, conf) 
SELECT 
  u.id,
  (data.player_pos)::smallint,
  data.player_name,
  (data.troop_id)::smallint,
  (data.star_level)::smallint,
  0.95
FROM public.uploads u,
(VALUES
  -- Popular troops in Bronze I (overused)
  (1, 'player1', 2, 1), (1, 'player1', 3, 1), (1, 'player1', 5, 2), (1, 'player1', 8, 1), (1, 'player1', 13, 2), (1, 'player1', 17, 1),
  (2, 'player2', 2, 0), (2, 'player2', 3, 2), (2, 'player2', 5, 1), (2, 'player2', 8, 0), (2, 'player2', 13, 1), (2, 'player2', 17, 2),
  (3, 'player3', 2, 1), (3, 'player3', 3, 1), (3, 'player3', 5, 2), (3, 'player3', 8, 2), (3, 'player3', 13, 0), (3, 'player3', 17, 1),
  (4, 'player4', 2, 0), (4, 'player4', 3, 0), (4, 'player4', 5, 1), (4, 'player4', 8, 1), (4, 'player4', 13, 2), (4, 'player4', 17, 0)
) AS data(player_pos, player_name, troop_id, star_level)
WHERE u.league = 'Bronze I' AND u.filename = 'demo_bronze_1.png';

-- Add more Bronze I data with different compositions
INSERT INTO public.detections (upload_id, player_pos, player_name, troop_id, star_level, conf) 
SELECT 
  u.id,
  (data.player_pos)::smallint,
  data.player_name,
  (data.troop_id)::smallint,
  (data.star_level)::smallint,
  0.92
FROM public.uploads u,
(VALUES
  -- Mix of popular and some underused troops
  (1, 'bronzepro', 1, 0), (1, 'bronzepro', 3, 1), (1, 'bronzepro', 7, 1), (1, 'bronzepro', 13, 2), (1, 'bronzepro', 15, 0), (1, 'bronzepro', 17, 1),
  (2, 'newbie', 2, 0), (2, 'newbie', 5, 1), (2, 'newbie', 8, 0), (2, 'newbie', 12, 0), (2, 'newbie', 16, 1), (2, 'newbie', 19, 0),
  (3, 'casual', 4, 0), (3, 'casual', 6, 0), (3, 'casual', 9, 1), (3, 'casual', 11, 0), (3, 'casual', 14, 1), (3, 'casual', 18, 0),
  (4, 'tryhard', 2, 1), (4, 'tryhard', 3, 2), (4, 'tryhard', 5, 2), (4, 'tryhard', 8, 1), (4, 'tryhard', 13, 2), (4, 'tryhard', 17, 2)
) AS data(player_pos, player_name, troop_id, star_level)
WHERE u.league = 'Bronze I' AND u.filename = 'demo_bronze_2.png';

-- Add third Bronze I match
INSERT INTO public.detections (upload_id, player_pos, player_name, troop_id, star_level, conf) 
SELECT 
  u.id,
  (data.player_pos)::smallint,
  data.player_name,
  (data.troop_id)::smallint,
  (data.star_level)::smallint,
  0.88
FROM public.uploads u,
(VALUES
  -- More varied compositions
  (1, 'winner', 1, 1), (1, 'winner', 7, 2), (1, 'winner', 10, 1), (1, 'winner', 14, 2), (1, 'winner', 16, 0), (1, 'winner', 20, 1),
  (2, 'second', 3, 1), (2, 'second', 5, 1), (2, 'second', 8, 2), (2, 'second', 13, 1), (2, 'second', 15, 1), (2, 'second', 17, 1),
  (3, 'third', 2, 0), (3, 'third', 6, 0), (3, 'third', 9, 0), (3, 'third', 12, 1), (3, 'third', 18, 0), (3, 'third', 19, 1),
  (4, 'fourth', 4, 0), (4, 'fourth', 11, 0), (4, 'fourth', 13, 1), (4, 'fourth', 14, 1), (4, 'fourth', 17, 0), (4, 'fourth', 20, 0)
) AS data(player_pos, player_name, troop_id, star_level)
WHERE u.league = 'Bronze I' AND u.filename = 'demo_bronze_3.png';

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW public.league_usage;