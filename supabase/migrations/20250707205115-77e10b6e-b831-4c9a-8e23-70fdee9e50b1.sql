-- Enable real-time for uploads table
ALTER TABLE public.uploads REPLICA IDENTITY FULL;

-- Add uploads table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.uploads;