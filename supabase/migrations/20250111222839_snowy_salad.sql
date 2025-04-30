/*
  # Add Post Analytics Table

  1. New Tables
    - `post_analytics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `post_id` (uuid, references social_media_posts)
      - `likes` (integer)
      - `comments` (integer)
      - `shares` (integer)
      - `reach` (integer)
      - `recorded_at` (timestamptz)

  2. Security
    - Enable RLS on `post_analytics` table
    - Add policies for authenticated users to manage their own analytics
*/

CREATE TABLE IF NOT EXISTS post_analytics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    post_id uuid REFERENCES social_media_posts(id) ON DELETE CASCADE NOT NULL,
    likes integer DEFAULT 0,
    comments integer DEFAULT 0,
    shares integer DEFAULT 0,
    reach integer DEFAULT 0,
    recorded_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own analytics"
    ON post_analytics
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
    ON post_analytics
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_analytics_user_id ON post_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_post_id ON post_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_recorded_at ON post_analytics(recorded_at);