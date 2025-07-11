-- Create page_views table to track individual page views
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL, -- Can be IP address or fingerprint
  page_path TEXT NOT NULL DEFAULT '/',
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique_visitors table to track daily unique visitors
CREATE TABLE public.unique_visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  first_visit_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(visitor_id, date)
);

-- Enable RLS on both tables
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unique_visitors ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view all page views" 
ON public.page_views 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Anyone can insert page views" 
ON public.page_views 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all unique visitors" 
ON public.unique_visitors 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Anyone can insert unique visitors" 
ON public.unique_visitors 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX idx_page_views_visitor_id ON public.page_views(visitor_id);
CREATE INDEX idx_unique_visitors_date ON public.unique_visitors(date);
CREATE INDEX idx_unique_visitors_visitor_id ON public.unique_visitors(visitor_id);