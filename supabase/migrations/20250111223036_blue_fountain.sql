/*
  # Email Campaign System

  1. New Tables
    - `email_templates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `subject` (text)
      - `content` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `email_campaigns`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `template_id` (uuid, references email_templates)
      - `status` (text)
      - `scheduled_for` (timestamptz)
      - `sent_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `email_subscribers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `email` (text)
      - `name` (text)
      - `status` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `campaign_analytics`
      - `id` (uuid, primary key)
      - `campaign_id` (uuid, references email_campaigns)
      - `opens` (integer)
      - `clicks` (integer)
      - `bounces` (integer)
      - `unsubscribes` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Email Campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    template_id uuid REFERENCES email_templates(id) ON DELETE SET NULL,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'failed')),
    scheduled_for timestamptz,
    sent_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Email Subscribers
CREATE TABLE IF NOT EXISTS email_subscribers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email text NOT NULL,
    name text,
    status text DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, email)
);

-- Campaign Analytics
CREATE TABLE IF NOT EXISTS campaign_analytics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid REFERENCES email_campaigns(id) ON DELETE CASCADE NOT NULL,
    opens integer DEFAULT 0,
    clicks integer DEFAULT 0,
    bounces integer DEFAULT 0,
    unsubscribes integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for email_templates
CREATE POLICY "Users can view own templates"
    ON email_templates FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own templates"
    ON email_templates FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies for email_campaigns
CREATE POLICY "Users can view own campaigns"
    ON email_campaigns FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own campaigns"
    ON email_campaigns FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies for email_subscribers
CREATE POLICY "Users can view own subscribers"
    ON email_subscribers FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subscribers"
    ON email_subscribers FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies for campaign_analytics
CREATE POLICY "Users can view own campaign analytics"
    ON campaign_analytics FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM email_campaigns
        WHERE email_campaigns.id = campaign_id
        AND email_campaigns.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage own campaign analytics"
    ON campaign_analytics FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM email_campaigns
        WHERE email_campaigns.id = campaign_id
        AND email_campaigns.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM email_campaigns
        WHERE email_campaigns.id = campaign_id
        AND email_campaigns.user_id = auth.uid()
    ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_user_id ON email_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_user_id ON email_subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);