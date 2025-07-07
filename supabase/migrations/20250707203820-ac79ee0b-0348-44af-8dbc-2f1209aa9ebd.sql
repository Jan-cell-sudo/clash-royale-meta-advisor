-- Add sample upload data to demonstrate the system
INSERT INTO public.uploads (user_id, filename, storage_path, league, parse_status, upload_time) VALUES
(gen_random_uuid(), 'sample_bronze_1.png', 'demo/sample_bronze_1.png', 'Bronze I', 'completed', now() - interval '2 hours'),
(gen_random_uuid(), 'sample_bronze_2.png', 'demo/sample_bronze_2.png', 'Bronze I', 'completed', now() - interval '1 hour'),
(gen_random_uuid(), 'sample_bronze_3.png', 'demo/sample_bronze_3.png', 'Bronze I', 'completed', now() - interval '30 minutes'),
(gen_random_uuid(), 'sample_silver_1.png', 'demo/sample_silver_1.png', 'Silver I', 'completed', now() - interval '1 hour'),
(gen_random_uuid(), 'sample_gold_1.png', 'demo/sample_gold_1.png', 'Gold I', 'completed', now() - interval '45 minutes');

-- Add sample detection data based on the game screenshots provided
-- This simulates the AI analyzing troop compositions from match screenshots

-- Bronze I league detections (favoring some troops heavily)
INSERT INTO public.detections (upload_id, player_pos, player_name, troop_id, star_level, conf) 
SELECT 
  u.id,
  player_pos,
  player_name,
  troop_id,
  star_level,
  0.95
FROM public.uploads u
CROSS JOIN (VALUES
  -- First upload - player compositions
  (1, 'julien', 1, 0), (1, 'julien', 5, 2), (1, 'julien', 7, 2), (1, 'julien', 10, 2), (1, 'julien', 12, 0), (1, 'julien', 16, 0),
  (2, 'Thomas', 3, 3), (2, 'Thomas', 8, 0), (2, 'Thomas', 14, 1), (2, 'Thomas', 17, 0), (2, 'Thomas', 18, 1), (2, 'Thomas', 19, 0),
  (3, 'aR.5TH', 1, 0), (3, 'aR.5TH', 2, 1), (3, 'aR.5TH', 6, 0), (3, 'aR.5TH', 9, 0), (3, 'aR.5TH', 11, 0), (3, 'aR.5TH', 15, 0),
  (4, 'season', 4, 0), (4, 'season', 13, 1), (4, 'season', 14, 2), (4, 'season', 15, 1), (4, 'season', 20, 0), (4, 'season', 3, 1)
) AS t(player_pos, player_name, troop_id, star_level)
WHERE u.league = 'Bronze I'
LIMIT 24;

-- Second Bronze I upload with different compositions
INSERT INTO public.detections (upload_id, player_pos, player_name, troop_id, star_level, conf) 
SELECT 
  u.id,
  player_pos,
  player_name,
  troop_id,
  star_level,
  0.92
FROM public.uploads u
CROSS JOIN (VALUES
  (1, 'player1', 1, 1), (1, 'player1', 1, 0), (1, 'player1', 2, 2), (1, 'player1', 2, 1), (1, 'player1', 3, 0), (1, 'player1', 5, 1),
  (2, 'player2', 2, 0), (2, 'player2', 3, 1), (2, 'player2', 5, 0), (2, 'player2', 7, 2), (2, 'player2', 8, 1), (2, 'player2', 10, 0),
  (3, 'player3', 1, 2), (3, 'player3', 6, 1), (3, 'player3', 9, 0), (3, 'player3', 11, 0), (3, 'player3', 13, 1), (3, 'player3', 14, 0),
  (4, 'player4', 2, 1), (4, 'player4', 4, 0), (4, 'player4', 8, 1), (4, 'player4', 12, 0), (4, 'player4', 16, 1), (4, 'player4', 18, 0)
) AS t(player_pos, player_name, troop_id, star_level)
WHERE u.league = 'Bronze I' AND u.filename = 'sample_bronze_2.png';

-- Third Bronze I upload
INSERT INTO public.detections (upload_id, player_pos, player_name, troop_id, star_level, conf) 
SELECT 
  u.id,
  player_pos,
  player_name,
  troop_id,
  star_level,
  0.88
FROM public.uploads u
CROSS JOIN (VALUES
  (1, 'topplayer', 2, 2), (1, 'topplayer', 3, 1), (1, 'topplayer', 7, 1), (1, 'topplayer', 8, 0), (1, 'topplayer', 14, 2), (1, 'topplayer', 16, 1),
  (2, 'midplayer', 1, 1), (2, 'midplayer', 5, 0), (2, 'midplayer', 9, 1), (2, 'midplayer', 11, 0), (2, 'midplayer', 15, 1), (2, 'midplayer', 17, 0),
  (3, 'lowplayer', 4, 0), (3, 'lowplayer', 6, 1), (3, 'lowplayer', 10, 0), (3, 'lowplayer', 12, 1), (3, 'lowplayer', 19, 0), (3, 'lowplayer', 20, 0),
  (4, 'lastplayer', 1, 0), (4, 'lastplayer', 3, 2), (4, 'lastplayer', 13, 1), (4, 'lastplayer', 14, 0), (4, 'lastplayer', 18, 1), (4, 'lastplayer', 20, 1)
) AS t(player_pos, player_name, troop_id, star_level)
WHERE u.league = 'Bronze I' AND u.filename = 'sample_bronze_3.png';

-- Silver I league detections (different meta)
INSERT INTO public.detections (upload_id, player_pos, player_name, troop_id, star_level, conf) 
SELECT 
  u.id,
  player_pos,
  player_name,
  troop_id,
  star_level,
  0.91
FROM public.uploads u
CROSS JOIN (VALUES
  (1, 'silverpro', 3, 3), (1, 'silverpro', 5, 2), (1, 'silverpro', 8, 2), (1, 'silverpro', 14, 3), (1, 'silverpro', 17, 2), (1, 'silverpro', 19, 1),
  (2, 'silverace', 2, 2), (2, 'silverace', 7, 3), (2, 'silverace', 10, 2), (2, 'silverace', 13, 2), (2, 'silverace', 15, 2), (2, 'silverace', 18, 1),
  (3, 'silverking', 4, 1), (3, 'silverking', 6, 2), (3, 'silverking', 9, 1), (3, 'silverking', 11, 1), (3, 'silverking', 16, 2), (3, 'silverking', 20, 2),
  (4, 'silvernew', 1, 1), (4, 'silvernew', 12, 1), (4, 'silvernew', 3, 2), (4, 'silvernew', 8, 1), (4, 'silvernew', 14, 2), (4, 'silvernew', 17, 1)
) AS t(player_pos, player_name, troop_id, star_level)
WHERE u.league = 'Silver I';

-- Gold I league detections (advanced meta)
INSERT INTO public.detections (upload_id, player_pos, player_name, troop_id, star_level, conf) 
SELECT 
  u.id,
  player_pos,
  player_name,
  troop_id,
  star_level,
  0.94
FROM public.uploads u
CROSS JOIN (VALUES
  (1, 'goldmaster', 5, 3), (1, 'goldmaster', 8, 3), (1, 'goldmaster', 13, 3), (1, 'goldmaster', 17, 3), (1, 'goldmaster', 19, 2), (1, 'goldmaster', 20, 3),
  (2, 'goldchamp', 3, 3), (2, 'goldchamp', 7, 3), (2, 'goldchamp', 14, 3), (2, 'goldchamp', 15, 3), (2, 'goldchamp', 18, 3), (2, 'goldchamp', 19, 2),
  (3, 'goldpro', 2, 2), (3, 'goldpro', 5, 3), (3, 'goldpro', 8, 2), (3, 'goldpro', 13, 3), (3, 'goldpro', 17, 2), (3, 'goldpro', 20, 3),
  (4, 'goldstar', 3, 3), (4, 'goldstar', 7, 3), (4, 'goldstar', 14, 3), (4, 'goldstar', 15, 2), (4, 'goldstar', 17, 3), (4, 'goldstar', 19, 3)
) AS t(player_pos, player_name, troop_id, star_level)
WHERE u.league = 'Gold I';

-- Refresh the materialized view to include new data
REFRESH MATERIALIZED VIEW public.league_usage;