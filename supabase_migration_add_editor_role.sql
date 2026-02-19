-- Update the check constraint for role to include 'editor'
ALTER TABLE public.profiles 
DROP CONSTRAINT profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'client', 'editor'));

-- Update Policies to allow editors to manage media and playlists (similar to admin)
-- Media
CREATE POLICY "Editors can manage media"
  ON media FOR ALL
  USING ( exists ( select 1 from profiles where id = auth.uid() and role = 'editor' ) );

-- Playlists
CREATE POLICY "Editors can manage playlists"
  ON playlists FOR ALL
  USING ( exists ( select 1 from profiles where id = auth.uid() and role = 'editor' ) );

-- Screens (Editors can view all screens but maybe not assign?)
CREATE POLICY "Editors view all screens"
  ON screens FOR SELECT
  USING ( exists ( select 1 from profiles where id = auth.uid() and role = 'editor' ) );

-- Storage Policies for Editor
CREATE POLICY "Editor Upload Media"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'media' and exists ( select 1 from profiles where id = auth.uid() and role = 'editor' ) );

CREATE POLICY "Editor Delete Media"
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'media' and exists ( select 1 from profiles where id = auth.uid() and role = 'editor' ) );
