/*
  # Marketing Dashboard Core Tables

  1. New Tables
    - social_media_accounts
      - Platform connections and credentials
    - social_media_posts
      - Scheduled and published posts
    - content_library
      - Content assets and metadata
    - customers
      - Customer profiles and interactions
    - seo_tracking
      - SEO metrics and rankings
    - marketing_budgets
      - Budget allocation and tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Social Media Accounts
CREATE TABLE IF NOT EXISTS social_media_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    platform text NOT NULL,
    account_name text NOT NULL,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, platform, account_name)
);

-- Social Media Posts
CREATE TABLE IF NOT EXISTS social_media_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_id uuid REFERENCES social_media_accounts(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    media_urls text[] DEFAULT '{}',
    scheduled_for timestamptz,
    published_at timestamptz,
    status text DEFAULT 'draft',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Content Library
CREATE TABLE IF NOT EXISTS content_library (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    content_type text NOT NULL,
    content text NOT NULL,
    tags text[] DEFAULT '{}',
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email text,
    name text,
    status text DEFAULT 'lead',
    source text,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, email)
);

-- SEO Tracking
CREATE TABLE IF NOT EXISTS seo_tracking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    keyword text NOT NULL,
    ranking integer,
    url text,
    tracked_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Marketing Budgets
CREATE TABLE IF NOT EXISTS marketing_budgets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category text NOT NULL,
    amount numeric NOT NULL,
    spent numeric DEFAULT 0,
    period_start date NOT NULL,
    period_end date NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_budgets ENABLE ROW LEVEL SECURITY;

-- Create policies for each table
CREATE POLICY "Users can view own social media accounts"
    ON social_media_accounts FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own social media accounts"
    ON social_media_accounts FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own social media posts"
    ON social_media_posts FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own social media posts"
    ON social_media_posts FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own content"
    ON content_library FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own content"
    ON content_library FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own customers"
    ON customers FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own customers"
    ON customers FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own SEO tracking"
    ON seo_tracking FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own SEO tracking"
    ON seo_tracking FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own budgets"
    ON marketing_budgets FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own budgets"
    ON marketing_budgets FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_media_accounts_user_id ON social_media_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_user_id ON social_media_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_scheduled ON social_media_posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_content_library_user_id ON content_library(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_tracking_user_id ON seo_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_budgets_user_id ON marketing_budgets(user_id);