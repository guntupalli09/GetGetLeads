/*
  # Add platform field to social media posts

  1. Changes
    - Add platform field to social_media_posts table
    - Copy platform from social_media_accounts table
    - Create index for platform field

  2. Notes
    - Uses safe ALTER TABLE operation
    - Maintains existing data integrity
*/

-- Add platform column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'social_media_posts' 
        AND column_name = 'platform'
    ) THEN
        ALTER TABLE social_media_posts ADD COLUMN platform text;
        
        -- Update existing posts with platform from their associated account
        UPDATE social_media_posts
        SET platform = social_media_accounts.platform
        FROM social_media_accounts
        WHERE social_media_posts.account_id = social_media_accounts.id;
        
        -- Create index for platform field
        CREATE INDEX IF NOT EXISTS idx_social_media_posts_platform ON social_media_posts(platform);
    END IF;
END $$;