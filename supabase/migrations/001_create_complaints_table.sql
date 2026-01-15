-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Citizen inputs
  citizen_text TEXT,
  citizen_voice_url TEXT,
  citizen_image_urls TEXT[],
  
  -- Location data
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_manual TEXT,
  location_ward TEXT,
  
  -- AI processed data
  ai_summary TEXT NOT NULL,
  ai_department TEXT NOT NULL,
  ai_issue_type TEXT NOT NULL,
  ai_priority TEXT NOT NULL CHECK (ai_priority IN ('high', 'medium', 'low')),
  ai_priority_explanation TEXT NOT NULL,
  ai_confidence DOUBLE PRECISION NOT NULL CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  
  -- Status management
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')),
  rejection_reason TEXT,
  
  -- Validation
  is_valid BOOLEAN NOT NULL DEFAULT true,
  validation_message TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_department ON complaints(ai_department);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(ai_priority);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_location_ward ON complaints(location_ward);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_complaints_updated_at 
  BEFORE UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)
-- For MVP, allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations for authenticated users" ON complaints
  FOR ALL USING (true);

-- Create storage buckets for media files
-- Note: Run these in Supabase Dashboard SQL Editor or via Supabase CLI

-- For images
INSERT INTO storage.buckets (id, name, public)
VALUES ('image-complaints', 'image-complaints', true)
ON CONFLICT (id) DO NOTHING;

-- For voice recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-complaints', 'voice-complaints', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (allow all for MVP)
CREATE POLICY "Allow public uploads to image-complaints" 
ON storage.objects FOR INSERT 
TO public
WITH CHECK (bucket_id = 'image-complaints');

CREATE POLICY "Allow public uploads to voice-complaints" 
ON storage.objects FOR INSERT 
TO public
WITH CHECK (bucket_id = 'voice-complaints');

CREATE POLICY "Allow public access to image-complaints" 
ON storage.objects FOR SELECT 
TO public
USING (bucket_id = 'image-complaints');

CREATE POLICY "Allow public access to voice-complaints" 
ON storage.objects FOR SELECT 
TO public
USING (bucket_id = 'voice-complaints');
