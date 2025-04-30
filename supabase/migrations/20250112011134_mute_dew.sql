/*
  # Email Campaign System Tables

  1. New Tables
    - `email_templates`
      - Template storage for reusable email content
      - Fields for name, subject, content
    - `email_campaigns`
      - Campaign management and scheduling
      - Links to templates and tracks status
    - `email_subscribers`
      - Subscriber list management
      - Tracks subscription status and metadata
    - `campaign_analytics`
      - Campaign performance tracking
      - Stores metrics like opens, clicks, bounces

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users to manage their own data
*/

-- Create tables if they don't exist
DO $$ 
BEGIN
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
END $$;

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
    -- Policies for email_templates
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'email_templates' 
        AND policyname = 'Users can view own templates'
    ) THEN
        CREATE POLICY "Users can view own templates"
            ON email_templates FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'email_templates' 
        AND policyname = 'Users can manage own templates'
    ) THEN
        CREATE POLICY "Users can manage own templates"
            ON email_templates FOR ALL
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Policies for email_campaigns
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'email_campaigns' 
        AND policyname = 'Users can view own campaigns'
    ) THEN
        CREATE POLICY "Users can view own campaigns"
            ON email_campaigns FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'email_campaigns' 
        AND policyname = 'Users can manage own campaigns'
    ) THEN
        CREATE POLICY "Users can manage own campaigns"
            ON email_campaigns FOR ALL
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Policies for email_subscribers
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'email_subscribers' 
        AND policyname = 'Users can view own subscribers'
    ) THEN
        CREATE POLICY "Users can view own subscribers"
            ON email_subscribers FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'email_subscribers' 
        AND policyname = 'Users can manage own subscribers'
    ) THEN
        CREATE POLICY "Users can manage own subscribers"
            ON email_subscribers FOR ALL
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Policies for campaign_analytics
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'campaign_analytics' 
        AND policyname = 'Users can view own campaign analytics'
    ) THEN
        CREATE POLICY "Users can view own campaign analytics"
            ON campaign_analytics FOR SELECT
            TO authenticated
            USING (EXISTS (
                SELECT 1 FROM email_campaigns
                WHERE email_campaigns.id = campaign_id
                AND email_campaigns.user_id = auth.uid()
            ));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'campaign_analytics' 
        AND policyname = 'Users can manage own campaign analytics'
    ) THEN
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
    END IF;
END $$;

-- Create indexes if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'email_templates' 
        AND indexname = 'idx_email_templates_user_id'
    ) THEN
        CREATE INDEX idx_email_templates_user_id ON email_templates(user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'email_campaigns' 
        AND indexname = 'idx_email_campaigns_user_id'
    ) THEN
        CREATE INDEX idx_email_campaigns_user_id ON email_campaigns(user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'email_subscribers' 
        AND indexname = 'idx_email_subscribers_user_id'
    ) THEN
        CREATE INDEX idx_email_subscribers_user_id ON email_subscribers(user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'campaign_analytics' 
        AND indexname = 'idx_campaign_analytics_campaign_id'
    ) THEN
        CREATE INDEX idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);
    END IF;
END $$;