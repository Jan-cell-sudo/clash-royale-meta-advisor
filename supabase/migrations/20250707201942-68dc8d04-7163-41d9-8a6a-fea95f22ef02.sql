-- Create uploads table
CREATE TABLE public.uploads (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  league TEXT,
  upload_time TIMESTAMPTZ DEFAULT now(),
  parse_status TEXT DEFAULT 'pending' CHECK (parse_status IN ('pending', 'processing', 'completed', 'failed')),
  phash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create detections table
CREATE TABLE public.detections (
  id BIGSERIAL PRIMARY KEY,
  upload_id BIGINT REFERENCES uploads(id) ON DELETE CASCADE,
  player_pos SMALLINT CHECK (player_pos >= 1 AND player_pos <= 4),
  player_name TEXT,
  troop_id SMALLINT CHECK (troop_id >= 1 AND troop_id <= 20),
  star_level SMALLINT DEFAULT 0 CHECK (star_level >= 0 AND star_level <= 4),
  conf REAL CHECK (conf >= 0 AND conf <= 1),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create troop_types reference table
CREATE TABLE public.troop_types (
  id SMALLINT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  trait_family TEXT
);

-- Insert the 20 launch troops (based on the game images)
INSERT INTO public.troop_types (id, name, trait_family) VALUES
(1, 'Goblin', 'Small'),
(2, 'Knight', 'Tank'),
(3, 'Archer', 'Ranged'),
(4, 'Valkyrie', 'Splash'),
(5, 'Goblin Giant', 'Tank'),
(6, 'Princess', 'Ranged'),
(7, 'Bandit', 'Melee'),
(8, 'Prince', 'Charge'),
(9, 'Log Spirit', 'Spirit'),
(10, 'Archer Queen', 'Champion'),
(11, 'Black Knight', 'Tank'),
(12, 'Spearman', 'Melee'),
(13, 'Giant', 'Tank'),
(14, 'Wizard', 'Splash'),
(15, 'Musketeer', 'Ranged'),
(16, 'Hog Rider', 'Fast'),
(17, 'Barbarian', 'Melee'),
(18, 'Minion', 'Flying'),
(19, 'Dragon', 'Flying'),
(20, 'Golem', 'Tank');

-- Create leagues reference table
CREATE TABLE public.leagues (
  id SMALLINT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  min_trophies INTEGER,
  max_trophies INTEGER
);

-- Insert league data
INSERT INTO public.leagues (id, name, min_trophies, max_trophies) VALUES
(1, 'Bronze I', 0, 199),
(2, 'Bronze II', 200, 399),
(3, 'Bronze III', 400, 599),
(4, 'Silver I', 600, 799),
(5, 'Silver II', 800, 999),
(6, 'Silver III', 1000, 1199),
(7, 'Gold I', 1200, 1599),
(8, 'Gold II', 1600, 1999),
(9, 'Gold III', 2000, 2499),
(10, 'Diamond', 2500, 9999);

-- Create materialized view for fast advice queries
CREATE MATERIALIZED VIEW public.league_usage AS
SELECT 
  u.league,
  d.troop_id,
  tt.name as troop_name,
  COUNT(*) as usage_count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY u.league) as usage_percentage
FROM detections d
JOIN uploads u ON u.id = d.upload_id
JOIN troop_types tt ON tt.id = d.troop_id
WHERE u.parse_status = 'completed'
GROUP BY u.league, d.troop_id, tt.name;

-- Enable Row Level Security
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.troop_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public read access to troop_types" ON public.troop_types FOR SELECT USING (true);
CREATE POLICY "Public read access to leagues" ON public.leagues FOR SELECT USING (true);

CREATE POLICY "Users can view all uploads" ON public.uploads FOR SELECT USING (true);
CREATE POLICY "Users can insert their own uploads" ON public.uploads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own uploads" ON public.uploads FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all detections" ON public.detections FOR SELECT USING (true);
CREATE POLICY "Users can insert detections" ON public.detections FOR INSERT WITH CHECK (true);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION public.refresh_league_usage()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.league_usage;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh view after inserts
CREATE TRIGGER refresh_league_usage_trigger
  AFTER INSERT ON public.detections
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.refresh_league_usage();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for uploads table
CREATE TRIGGER update_uploads_updated_at
  BEFORE UPDATE ON public.uploads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('screenshots', 'screenshots', false);

-- Create storage policies
CREATE POLICY "Users can upload screenshots" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own screenshots" ON storage.objects
  FOR SELECT USING (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "System can manage screenshots" ON storage.objects
  FOR ALL USING (bucket_id = 'screenshots');