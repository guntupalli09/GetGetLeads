/*
  # Enhanced SEO Features

  1. New Tables
    - `seo_competitor_tracking`
      - Track competitor rankings for keywords
    - `seo_historical_data`
      - Store historical ranking data
    - `seo_backlinks`
      - Track backlink information
    - `seo_page_metrics`
      - Store page performance metrics

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Competitor Tracking
CREATE TABLE IF NOT EXISTS seo_competitor_tracking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    keyword_id uuid REFERENCES seo_tracking(id) ON DELETE CASCADE NOT NULL,
    competitor_url text NOT NULL,
    competitor_ranking integer,
    tracked_at timestamptz DEFAULT now()
);

-- Historical Data
CREATE TABLE IF NOT EXISTS seo_historical_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    keyword_id uuid REFERENCES seo_tracking(id) ON DELETE CASCADE NOT NULL,
    ranking integer,
    tracked_at timestamptz DEFAULT now()
);

-- Backlinks
CREATE TABLE IF NOT EXISTS seo_backlinks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    source_url text NOT NULL,
    target_url text NOT NULL,
    domain_authority numeric,
    status text DEFAULT 'active',
    first_seen timestamptz DEFAULT now(),
    last_checked timestamptz DEFAULT now()
);

-- Page Metrics
CREATE TABLE IF NOT EXISTS seo_page_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    url text NOT NULL,
    load_time numeric,
    mobile_score numeric,
    desktop_score numeric,
    core_web_vitals jsonb,
    checked_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE seo_competitor_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_historical_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_backlinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_page_metrics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own competitor tracking"
    ON seo_competitor_tracking FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own competitor tracking"
    ON seo_competitor_tracking FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own historical data"
    ON seo_historical_data FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own historical data"
    ON seo_historical_data FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own backlinks"
    ON seo_backlinks FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own backlinks"
    ON seo_backlinks FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own page metrics"
    ON seo_page_metrics FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own page metrics"
    ON seo_page_metrics FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_competitor_tracking_user_id ON seo_competitor_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_historical_data_user_id ON seo_historical_data(user_id);
CREATE INDEX IF NOT EXISTS idx_backlinks_user_id ON seo_backlinks(user_id);
CREATE INDEX IF NOT EXISTS idx_page_metrics_user_id ON seo_page_metrics(user_id);