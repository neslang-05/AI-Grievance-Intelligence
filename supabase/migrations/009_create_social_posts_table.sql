-- Create social_posts table for social listening
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'facebook', 'instagram', 'reddit')),
  author_handle TEXT NOT NULL,
  author_name TEXT,
  content TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  sentiment_score DOUBLE PRECISION,
  is_processed BOOLEAN DEFAULT false,
  related_complaint_id UUID REFERENCES complaints(id),
  ai_processed_content JSONB
);

-- Enable RLS
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- Allow all operations for MVP
CREATE POLICY "Allow all operations for socialPosts" ON social_posts
  FOR ALL USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at DESC);
