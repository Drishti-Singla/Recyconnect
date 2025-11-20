-- Add status field to users table

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' 
CHECK (status IN ('active', 'suspended', 'pending', 'inactive'));

-- Update existing users to have 'active' status
UPDATE users SET status = 'active' WHERE status IS NULL;

COMMENT ON COLUMN users.status IS 'User account status: active, suspended, pending, or inactive';
