-- Add college_code field to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS college_code VARCHAR(10);

-- Add index for college_code lookups
CREATE INDEX IF NOT EXISTS idx_users_college_code ON users(college_code);
