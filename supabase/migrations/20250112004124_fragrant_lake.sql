/*
  # SEO Research and Optimization Tools

  1. New Tables
    - `seo_keyword_research`
      - Store keyword suggestions and metrics
    - `seo_content_suggestions`
      - Store content optimization recommendations
    
  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Keyword Research
CREATE TABLE IF NOT EXISTS seo_keyword_research (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    keyword text NOT NULL,
    search_volume integer,
    difficulty numeric,
    cpc numeric,
    related_keywords text[],
    created_at timestamptz DEFAULT now()
);

-- Content Optimization
CREATE TABLE IF NOT EXISTS seo_content_suggestions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    url text NOT NULL,
    target_keyword text NOT NULL,
    content_score numeric,
    suggestions jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE seo_keyword_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_content_suggestions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own keyword research"
    ON seo_keyword_research FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own keyword research"
    ON seo_keyword_research FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own content suggestions"
    ON seo_content_suggestions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own content suggestions"
    ON seo_content_suggestions FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_keyword_research_user_id ON seo_keyword_research(user_id);
CREATE INDEX IF NOT EXISTS idx_content_suggestions_user_id ON seo_content_suggestions(user_id);