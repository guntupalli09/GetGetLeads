/*
  # Update Social Media Tables

  1. Tables
    - Ensures social_media_accounts and social_media_posts tables exist
    - Adds platform field to posts table
    - Adds metadata field to posts table

  2. Security
    - Enables RLS if not already enabled
    - Creates missing policies safely
    - Updates existing policies if needed

  3. Indexes
    - Creates additional indexes for better performance
*/

-- Create tables if they don't exist
DO $$ 
BEGIN
    -- Social Media Accounts
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'social_media_accounts'
    ) THEN
        CREATE TABLE social_media_accounts (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            platform text NOT NULL,
            account_name text NOT NULL,
            metadata jsonb DEFAULT '{}',
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            UNIQUE(user_id, platform, account_name)
        );
    END IF;

    -- Social Media Posts
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'social_media_posts'
    ) THEN
        CREATE TABLE social_media_posts (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            account_id uuid REFERENCES social_media_accounts(id) ON DELETE CASCADE NOT NULL,
            content text NOT NULL,
            media_urls text[] DEFAULT '{}',
            platform text NOT NULL,
            scheduled_for timestamptz,
            published_at timestamptz,
            status text DEFAULT 'draft',
            metadata jsonb DEFAULT '{}',
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );
    END IF;
END $$;

-- Add platform column to posts if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'social_media_posts' 
        AND column_name = 'platform'
    ) THEN
        ALTER TABLE social_media_posts ADD COLUMN platform text;
    END IF;
END $$;

-- Add metadata column to posts if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'social_media_posts' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE social_media_posts ADD COLUMN metadata jsonb DEFAULT '{}';
    END IF;
END $$;

-- Enable RLS
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
    -- Policies for social_media_accounts
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'social_media_accounts' 
        AND policyname = 'Users can view own social media accounts'
    ) THEN
        CREATE POLICY "Users can view own social media accounts"
            ON social_media_accounts
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'social_media_accounts' 
        AND policyname = 'Users can manage own social media accounts'
    ) THEN
        CREATE POLICY "Users can manage own social media accounts"
            ON social_media_accounts
            FOR ALL
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Policies for social_media_posts
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'social_media_posts' 
        AND policyname = 'Users can view own social media posts'
    ) THEN
        CREATE POLICY "Users can view own social media posts"
            ON social_media_posts
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'social_media_posts' 
        AND policyname = 'Users can manage own social media posts'
    ) THEN
        CREATE POLICY "Users can manage own social media posts"
            ON social_media_posts
            FOR ALL
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Create indexes if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'social_media_accounts' 
        AND indexname = 'idx_social_media_accounts_user_id'
    ) THEN
        CREATE INDEX idx_social_media_accounts_user_id ON social_media_accounts(user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'social_media_posts' 
        AND indexname = 'idx_social_media_posts_user_id'
    ) THEN
        CREATE INDEX idx_social_media_posts_user_id ON social_media_posts(user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'social_media_posts' 
        AND indexname = 'idx_social_media_posts_account_id'
    ) THEN
        CREATE INDEX idx_social_media_posts_account_id ON social_media_posts(account_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'social_media_posts' 
        AND indexname = 'idx_social_media_posts_scheduled_for'
    ) THEN
        CREATE INDEX idx_social_media_posts_scheduled_for ON social_media_posts(scheduled_for);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'social_media_posts' 
        AND indexname = 'idx_social_media_posts_platform'
    ) THEN
        CREATE INDEX idx_social_media_posts_platform ON social_media_posts(platform);
    END IF;
END $$;