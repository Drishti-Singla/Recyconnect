-- Add anonymity column to donated_items table
ALTER TABLE donated_items 
ADD COLUMN IF NOT EXISTS anonymity VARCHAR(20) DEFAULT 'public' 
CHECK (anonymity IN ('public', 'anonymous', 'partial'));
