-- Add reference_id column to complaints table
-- This is a human-friendly 8-character alphanumeric ID (e.g., PW7K2M9X)

ALTER TABLE complaints 
ADD COLUMN reference_id TEXT UNIQUE;

-- Create index for fast lookups by reference_id
CREATE INDEX IF NOT EXISTS idx_complaints_reference_id ON complaints(reference_id);

-- Add comment to explain the column
COMMENT ON COLUMN complaints.reference_id IS 'Human-friendly 8-character reference ID (format: 2-letter dept code + 6 alphanumeric chars)';
