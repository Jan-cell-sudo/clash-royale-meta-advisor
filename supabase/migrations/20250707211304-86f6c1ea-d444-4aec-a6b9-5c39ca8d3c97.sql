-- Add trophy_count column to uploads table
ALTER TABLE public.uploads 
ADD COLUMN trophy_count INTEGER;

-- Add index for trophy_count for better query performance
CREATE INDEX idx_uploads_trophy_count ON public.uploads(trophy_count);