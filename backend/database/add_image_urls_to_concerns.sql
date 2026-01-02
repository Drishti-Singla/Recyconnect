-- Add image_urls column to user_concerns table
ALTER TABLE user_concerns
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN user_concerns.image_urls IS 'Array of Cloudinary image URLs for evidence/screenshots';
