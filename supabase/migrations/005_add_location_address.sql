-- Migration: Replace location_manual and location_ward with location_address
-- This migration consolidates location text fields into a single address field

-- Add the new location_address column
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS location_address TEXT;

-- Migrate existing data: combine location_manual and location_ward into location_address
UPDATE complaints 
SET location_address = COALESCE(
  CASE 
    WHEN location_manual IS NOT NULL AND location_ward IS NOT NULL 
      THEN location_manual || ', ' || location_ward
    WHEN location_manual IS NOT NULL 
      THEN location_manual
    WHEN location_ward IS NOT NULL 
      THEN location_ward
    ELSE NULL
  END
)
WHERE location_address IS NULL 
  AND (location_manual IS NOT NULL OR location_ward IS NOT NULL);

-- Drop the old columns (optional - you may want to keep them for a transition period)
-- ALTER TABLE complaints DROP COLUMN IF EXISTS location_manual;
-- ALTER TABLE complaints DROP COLUMN IF EXISTS location_ward;

-- Drop the old index on location_ward
DROP INDEX IF EXISTS idx_complaints_location_ward;

-- Create new index on location_address
CREATE INDEX IF NOT EXISTS idx_complaints_location_address ON complaints(location_address);
