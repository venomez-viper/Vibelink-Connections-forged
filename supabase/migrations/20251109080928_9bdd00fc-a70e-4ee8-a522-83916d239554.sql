-- Remove email column from profiles table
-- Email is already available via auth.users and should not be duplicated in profiles
-- This prevents email harvesting while maintaining discovery functionality
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;