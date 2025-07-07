-- Create trigger to refresh materialized view when detections are inserted
CREATE OR REPLACE TRIGGER refresh_usage_on_detection_insert
  AFTER INSERT ON public.detections
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.refresh_league_usage();