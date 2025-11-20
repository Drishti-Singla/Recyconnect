-- Update reported_items table to support verified and pending statuses
-- This adds 'pending', 'verified', and 'flagged' as valid status values

-- First, drop the existing constraint
ALTER TABLE reported_items DROP CONSTRAINT IF EXISTS reported_items_status_check;

-- Add new constraint with additional status values
ALTER TABLE reported_items 
ADD CONSTRAINT reported_items_status_check 
CHECK (status IN ('pending', 'active', 'verified', 'resolved', 'inactive', 'flagged'));

-- Update existing 'active' items to 'pending' (items that haven't been verified yet)
-- This is optional - only run if you want existing items to start as pending
-- UPDATE reported_items SET status = 'pending' WHERE status = 'active';

-- Set default status to 'pending' for new items
ALTER TABLE reported_items ALTER COLUMN status SET DEFAULT 'pending';
