-- Fix the materialized view refresh issue
-- First, create a unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS league_usage_unique_idx 
ON public.league_usage (league, troop_id);

-- Now refresh without CONCURRENTLY first time
REFRESH MATERIALIZED VIEW public.league_usage;

-- Update the function to use regular refresh instead of concurrent
CREATE OR REPLACE FUNCTION public.refresh_league_usage()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.league_usage;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;