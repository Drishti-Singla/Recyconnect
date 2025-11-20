-- Update the donated_items condition constraint to accept more values
ALTER TABLE donated_items DROP CONSTRAINT IF EXISTS donated_items_condition_check;

ALTER TABLE donated_items ADD CONSTRAINT donated_items_condition_check 
CHECK (condition IN ('brand-new', 'like-new', 'gently-used', 'heavily-used', 'needs-repair', 'excellent', 'good', 'fair', 'poor'));
