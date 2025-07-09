-- Phase 1: Critical Admin Security - Create proper user roles system

-- Create enum for application roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for proper role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- Create security definer function to check if current user has role
CREATE OR REPLACE FUNCTION public.current_user_has_role(_role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT public.has_role(auth.uid(), _role)
$$;

-- Create security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT public.current_user_has_role('admin')
$$;

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.is_admin());

-- Update existing RLS policies to use the new role system

-- Update admin_stats policies
DROP POLICY IF EXISTS "Admins can manage admin stats" ON public.admin_stats;
CREATE POLICY "Admins can manage admin stats"
ON public.admin_stats
FOR ALL
USING (public.is_admin());

-- Update counter_advice policies  
DROP POLICY IF EXISTS "Admins can manage counter advice" ON public.counter_advice;
CREATE POLICY "Admins can manage counter advice"
ON public.counter_advice
FOR ALL
USING (public.is_admin());

-- Update storage policies for troop-images bucket
DROP POLICY IF EXISTS "Admins can upload troop images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update troop images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete troop images" ON storage.objects;

CREATE POLICY "Admins can upload troop images"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'troop-images' AND 
    public.is_admin()
);

CREATE POLICY "Admins can update troop images"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'troop-images' AND 
    public.is_admin()
);

CREATE POLICY "Admins can delete troop images"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'troop-images' AND 
    public.is_admin()
);

-- Insert the current admin user (assuming they have a profile)
-- This will need to be run after the user signs in at least once
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'admin'::app_role
FROM public.profiles p
WHERE p.email = 'waterflesjan@gmail.com' AND p.is_admin = true
ON CONFLICT (user_id, role) DO NOTHING;

-- Add trigger for updated_at on user_roles
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 2: Upload System Security - Tighten upload policies

-- Remove overly permissive anonymous upload policies
DROP POLICY IF EXISTS "Allow anonymous uploads" ON public.uploads;
DROP POLICY IF EXISTS "Allow anonymous updates" ON public.uploads;

-- Create more restrictive upload policies
CREATE POLICY "Authenticated users can upload"
ON public.uploads
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own uploads"
ON public.uploads
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any upload"
ON public.uploads
FOR UPDATE
TO authenticated
USING (public.is_admin());

-- Create audit log table for tracking admin actions
CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.audit_log
FOR SELECT
USING (public.is_admin());

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
    _action TEXT,
    _table_name TEXT DEFAULT NULL,
    _record_id TEXT DEFAULT NULL,
    _old_values JSONB DEFAULT NULL,
    _new_values JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), _action, _table_name, _record_id, _old_values, _new_values);
END;
$$;