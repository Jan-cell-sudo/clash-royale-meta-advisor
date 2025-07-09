-- Create a table to store admin-configurable stats
CREATE TABLE public.admin_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  screenshots_count INTEGER NOT NULL DEFAULT 0,
  contributors_count INTEGER NOT NULL DEFAULT 0,
  leagues_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage admin stats" 
ON public.admin_stats 
FOR ALL 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true) AND (profiles.email = 'waterflesjan@gmail.com'::text))));

CREATE POLICY "Anyone can view admin stats" 
ON public.admin_stats 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_admin_stats_updated_at
BEFORE UPDATE ON public.admin_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial default values
INSERT INTO public.admin_stats (screenshots_count, contributors_count, leagues_count)
VALUES (8, 2, 4);