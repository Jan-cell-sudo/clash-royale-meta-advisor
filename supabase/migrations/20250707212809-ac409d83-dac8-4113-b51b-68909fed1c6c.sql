-- Add slot_position column to track which slot each troop was in
ALTER TABLE public.detections 
ADD COLUMN slot_position INTEGER;

-- Add index for better performance on slot queries
CREATE INDEX idx_detections_slot_position ON public.detections(slot_position);

-- Update the materialized view to be more comprehensive
DROP MATERIALIZED VIEW IF EXISTS public.league_usage;

CREATE MATERIALIZED VIEW public.league_usage AS
SELECT 
  u.league,
  d.troop_id,
  tt.name as troop_name,
  tt.trait_family,
  COUNT(*) as usage_count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY u.league) as usage_percentage,
  AVG(d.star_level) as avg_star_level,
  AVG(d.conf) as avg_confidence,
  COUNT(DISTINCT d.upload_id) as screenshots_featured,
  COUNT(DISTINCT CASE WHEN d.player_pos = 1 THEN d.upload_id END) as winner_usage
FROM public.detections d
JOIN public.uploads u ON d.upload_id = u.id
JOIN public.troop_types tt ON d.troop_id = tt.id
WHERE u.parse_status = 'completed'
GROUP BY u.league, d.troop_id, tt.name, tt.trait_family;

-- Create unique index for the materialized view
CREATE UNIQUE INDEX league_usage_unique_idx 
ON public.league_usage (league, troop_id);