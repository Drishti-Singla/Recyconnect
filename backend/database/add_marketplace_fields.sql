-- Add asking_price and condition to items table
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS asking_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS condition VARCHAR(20) CHECK (condition IN ('new', 'like new', 'good', 'fair', 'poor'));
