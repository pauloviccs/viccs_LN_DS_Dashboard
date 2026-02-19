-- Enable Row Level Security (good practice to ensure it's active)
ALTER TABLE public.screens ENABLE ROW LEVEL SECURITY;

-- 1. Allow anonymous/public access to SELECT screens (for polling status)
CREATE POLICY "Allow public SELECT on screens"
ON public.screens
FOR SELECT
TO public
USING (true);

-- 2. Allow anonymous/public access to INSERT new screens (registration)
CREATE POLICY "Allow public INSERT on screens"
ON public.screens
FOR INSERT
TO public
WITH CHECK (true);

-- 3. Allow anonymous/public access to UPDATE screens (ping/heartbeat)
-- Note: Ideally we'd restrict this to the specific device ID, but without auth, 
-- we rely on the client knowing the ID.
CREATE POLICY "Allow public UPDATE on screens"
ON public.screens
FOR UPDATE
TO public
USING (true);
