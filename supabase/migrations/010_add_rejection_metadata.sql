-- Add rejected_by and rejected_at fields to complaints
ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS rejected_by UUID,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;

-- Index for rejected_at
CREATE INDEX IF NOT EXISTS idx_complaints_rejected_at ON complaints(rejected_at);
