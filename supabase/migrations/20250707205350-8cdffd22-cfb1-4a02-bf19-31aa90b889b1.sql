-- Fix RLS policies to allow anonymous uploads since no authentication is required
DROP POLICY IF EXISTS "Users can insert their own uploads" ON public.uploads;
DROP POLICY IF EXISTS "Users can update their own uploads" ON public.uploads;

-- Create new policies that allow anonymous access
CREATE POLICY "Allow anonymous uploads" 
ON public.uploads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow anonymous updates" 
ON public.uploads 
FOR UPDATE 
USING (true);