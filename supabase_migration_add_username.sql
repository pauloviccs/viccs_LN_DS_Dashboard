-- Add username column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username text UNIQUE;

-- Create an index for faster lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- RLS Policy Update (if needed) - Profiles are already viewable by everyone, so username is exposed.
-- No new policy needed for select, but ensure update policy allows changing it (it does: "Users can update own profile")
