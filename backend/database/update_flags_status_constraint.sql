-- Update flags table to allow 'under_review' status
ALTER TABLE flags 
DROP CONSTRAINT IF EXISTS flags_status_check;

ALTER TABLE flags 
ADD CONSTRAINT flags_status_check 
CHECK (status IN ('pending', 'under_review', 'reviewed', 'resolved', 'dismissed'));
