-- Fix RLS policies to allow anonymous uploads since no authentication is required
DROP POLICY IF EXISTS "Authenticated users can upload" ON public.uploads;
DROP POLICY IF EXISTS "Users can update their own uploads" ON public.uploads;

-- Create new policies that allow anonymous access for uploads
CREATE POLICY "Allow anonymous uploads" 
ON public.uploads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow anonymous updates" 
ON public.uploads 
FOR UPDATE 
USING (true);

-- Also fix the unique_visitors table policies for anonymous visitor tracking
DROP POLICY IF EXISTS "Anyone can insert unique visitors" ON public.unique_visitors;

CREATE POLICY "Allow anonymous visitor tracking" 
ON public.unique_visitors 
FOR INSERT 
WITH CHECK (true);