-- Create profiles bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to profiles
CREATE POLICY "Public Access Profiles"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'profiles' );

-- Allow authenticated users to upload to profiles
CREATE POLICY "Users can upload own profile photo"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Allow users to update their own profile photo
CREATE POLICY "Users can update own profile photo"
  ON storage.objects FOR UPDATE
  WITH CHECK ( bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1] );
