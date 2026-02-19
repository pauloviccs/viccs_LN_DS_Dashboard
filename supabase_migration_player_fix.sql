-- Add last_ping column to screens table if it doesn't exist
ALTER TABLE public.screens 
ADD COLUMN IF NOT EXISTS last_ping TIMESTAMPTZ DEFAULT now();

-- Ensure other columns used by Player also exist
ALTER TABLE public.screens 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS pairing_code TEXT,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS current_playlist_id UUID REFERENCES public.playlists(id);

-- Update RLS policies to allow Player to update its own last_ping (if needed)
-- Assuming 'anon' role needs update access for this specific column or row
-- Note: 'anon' usually implies unauthenticated, but the player uses the anon key. 
-- However, RLS might block updates if not properly configured.
-- For now, let's ensure the column exists.
