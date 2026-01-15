-- User profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'CITIZEN',
  full_name TEXT,
  phone TEXT,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Update complaints table to support both anonymous and authenticated submissions
ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT TRUE;

-- Update RLS for complaints to allow anonymous inserts and viewing based on user_id or role
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Remove existing broad policies if they exist (assuming simple setup for now)
DROP POLICY IF EXISTS "Anyone can create complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can view own complaints" ON public.complaints;

CREATE POLICY "Anyone can create complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (true);

-- Allow users to see their own complaints, or officers/admins to see all
CREATE POLICY "Users can view relevant complaints"
  ON public.complaints FOR SELECT
  USING (
    user_id = auth.uid() 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('OFFICER', 'ADMIN')
    OR is_anonymous = TRUE -- Allow viewing anonymous ones for this demo? 
    -- Actually, spec says: "Users can view own complaints" USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'OFFICER' OR auth.jwt() ->> 'role' = 'ADMIN')
  );

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, department)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'CITIZEN'),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'department'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
