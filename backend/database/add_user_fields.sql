-- Add missing fields to users table

-- Add bio field
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add roll_number field (user-provided only, not auto-generated)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS roll_number VARCHAR(50);

-- Add Google OAuth fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'local' 
CHECK (auth_provider IN ('local', 'google'));

-- Add index on google_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Update existing users to have 'local' as auth_provider
UPDATE users SET auth_provider = 'local' WHERE auth_provider IS NULL;

COMMENT ON COLUMN users.bio IS 'User biography or description';
COMMENT ON COLUMN users.roll_number IS 'Student/User roll number or identification number - user provided';
COMMENT ON COLUMN users.google_id IS 'Google account ID for OAuth users';
COMMENT ON COLUMN users.auth_provider IS 'Authentication provider: local (email/password) or google (OAuth)';
