-- Create a storage bucket for troop images
INSERT INTO storage.buckets (id, name, public) VALUES ('troop-images', 'troop-images', true);

-- Create policies for troop image uploads
CREATE POLICY "Anyone can view troop images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'troop-images');

CREATE POLICY "Admins can upload troop images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'troop-images' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
    AND profiles.email = 'waterflesjan@gmail.com'
  )
);

CREATE POLICY "Admins can update troop images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'troop-images' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
    AND profiles.email = 'waterflesjan@gmail.com'
  )
);

CREATE POLICY "Admins can delete troop images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'troop-images' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
    AND profiles.email = 'waterflesjan@gmail.com'
  )
);