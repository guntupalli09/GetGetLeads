-- Drop and recreate campaign_analytics table with proper structure
DO $$ 
BEGIN
    -- Drop existing table if it exists
    DROP TABLE IF EXISTS campaign_analytics CASCADE;

    -- Create campaign_analytics table with proper structure
    CREATE TABLE campaign_analytics (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        campaign_id uuid REFERENCES email_campaigns(id) ON DELETE CASCADE NOT NULL,
        opens integer DEFAULT 0,
        clicks integer DEFAULT 0,
        bounces integer DEFAULT 0,
        unsubscribes integer DEFAULT 0,
        revenue numeric DEFAULT 0,
        cost numeric DEFAULT 0,
        metadata jsonb DEFAULT '{}',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        UNIQUE(campaign_id)
    );

    -- Enable RLS
    ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view own campaign analytics"
        ON campaign_analytics FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can manage own campaign analytics"
        ON campaign_analytics FOR ALL
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

    -- Create indexes for better performance
    CREATE INDEX idx_campaign_analytics_user_id ON campaign_analytics(user_id);
    CREATE INDEX idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);
    CREATE INDEX idx_campaign_analytics_created_at ON campaign_analytics(created_at);

    -- Add updated_at trigger
    CREATE TRIGGER update_campaign_analytics_updated_at
        BEFORE UPDATE ON campaign_analytics
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    -- Create initial analytics entries for existing campaigns
    INSERT INTO campaign_analytics (user_id, campaign_id)
    SELECT user_id, id
    FROM email_campaigns
    ON CONFLICT (campaign_id) DO NOTHING;

END $$;