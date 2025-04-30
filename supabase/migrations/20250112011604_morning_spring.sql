/*
  # Add Social Media Analytics Tables

  1. New Tables
    - `social_analytics`
      - Stores detailed analytics data for social media posts
      - Tracks metrics like impressions, engagement, likes, comments, etc.
      - Links to social media posts

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Social Media Analytics
CREATE TABLE IF NOT EXISTS social_analytics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    post_id uuid REFERENCES social_media_posts(id) ON DELETE CASCADE NOT NULL,
    platform text NOT NULL,
    impressions integer DEFAULT 0,
    engagement integer DEFAULT 0,
    clicks integer DEFAULT 0,
    shares integer DEFAULT 0,
    likes integer DEFAULT 0,
    comments integer DEFAULT 0,
    recorded_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE social_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own analytics"
    ON social_analytics
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own analytics"
    ON social_analytics
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_social_analytics_user_id ON social_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_social_analytics_post_id ON social_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_social_analytics_platform ON social_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_social_analytics_recorded_at ON social_analytics(recorded_at);