-- Add user_id column to campaign_analytics table
DO $$ 
BEGIN
    -- Drop existing table if it exists
    DROP TABLE IF EXISTS campaign_analytics;

    -- Create campaign_analytics table with user_id
    CREATE TABLE campaign_analytics (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        campaign_id uuid REFERENCES email_campaigns(id) ON DELETE CASCADE NOT NULL,
        opens integer DEFAULT 0,
        clicks integer DEFAULT 0,
        bounces integer DEFAULT 0,
        unsubscribes integer DEFAULT 0,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
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

    -- Create indexes
    CREATE INDEX idx_campaign_analytics_user_id ON campaign_analytics(user_id);
    CREATE INDEX idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);
    CREATE INDEX idx_campaign_analytics_created_at ON campaign_analytics(created_at);

    -- Add updated_at trigger
    CREATE TRIGGER update_campaign_analytics_updated_at
        BEFORE UPDATE ON campaign_analytics
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
END $$;