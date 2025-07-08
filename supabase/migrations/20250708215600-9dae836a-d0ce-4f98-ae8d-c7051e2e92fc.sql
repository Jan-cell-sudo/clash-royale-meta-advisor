-- Create a table to manage counter advice for each league
CREATE TABLE public.counter_advice (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id SMALLINT NOT NULL,
  troop_id SMALLINT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 1,
  usage_percentage REAL NOT NULL DEFAULT 0.1,
  rank INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(league_id, troop_id)
);

-- Enable RLS
ALTER TABLE public.counter_advice ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view counter advice" 
ON public.counter_advice 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage counter advice" 
ON public.counter_advice 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
    AND profiles.email = 'waterflesjan@gmail.com'
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_counter_advice_updated_at
BEFORE UPDATE ON public.counter_advice
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data for Bronze league (matching existing advice)
INSERT INTO public.counter_advice (league_id, troop_id, usage_count, usage_percentage, rank)
SELECT 1, tt.id, 1, 0.1, ROW_NUMBER() OVER (ORDER BY tt.name)
FROM public.troop_types tt
WHERE tt.name IN ('Knight', 'Archer', 'Goblin')
ON CONFLICT (league_id, troop_id) DO NOTHING;