-- Add test detections for existing uploads to test the data flow
INSERT INTO public.detections (upload_id, troop_id, player_pos, player_name, star_level, conf) 
VALUES 
  (16, 1, 1, 'TestPlayer1', 2, 0.95),
  (16, 2, 2, 'TestPlayer2', 1, 0.88),
  (16, 3, 3, 'TestPlayer3', 3, 0.92),
  (15, 1, 1, 'TestPlayer4', 2, 0.87),
  (15, 4, 2, 'TestPlayer5', 1, 0.90),
  (14, 2, 1, 'TestPlayer6', 3, 0.85),
  (14, 3, 2, 'TestPlayer7', 2, 0.93),
  (13, 1, 1, 'TestPlayer8', 1, 0.89);

-- Manually refresh the materialized view to see the results
REFRESH MATERIALIZED VIEW public.league_usage;