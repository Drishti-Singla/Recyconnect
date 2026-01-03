-- Add quantity column to donated_items table
ALTER TABLE donated_items 
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1 CHECK (quantity > 0);
