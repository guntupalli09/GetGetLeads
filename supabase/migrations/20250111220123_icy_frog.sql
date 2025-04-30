/*
  # Fix schema with recorded_at timestamp
  
  1. Changes
    - Use recorded_at instead of created_at for user_metrics
    - Add safe policy creation
    - Add performance indexes
  
  2. Security
    - Enable RLS
    - Add policies for user data access
*/

DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS dashboard_preferences (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        layout jsonb DEFAULT '{}',
        theme text DEFAULT 'light',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        UNIQUE(user_id)
    );
EXCEPTION
    WHEN duplicate_table THEN
        NULL;
END $$;

DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS user_metrics (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        metric_name text NOT NULL,
        metric_value numeric NOT NULL,
        recorded_at timestamptz DEFAULT now(),
        UNIQUE(user_id, metric_name, recorded_at)
    );
EXCEPTION
    WHEN duplicate_table THEN
        NULL;
END $$;

-- Enable RLS
ALTER TABLE dashboard_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'dashboard_preferences' 
        AND policyname = 'Users can view own dashboard preferences'
    ) THEN
        CREATE POLICY "Users can view own dashboard preferences"
            ON dashboard_preferences
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'dashboard_preferences' 
        AND policyname = 'Users can insert own dashboard preferences'
    ) THEN
        CREATE POLICY "Users can insert own dashboard preferences"
            ON dashboard_preferences
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'dashboard_preferences' 
        AND policyname = 'Users can update own dashboard preferences'
    ) THEN
        CREATE POLICY "Users can update own dashboard preferences"
            ON dashboard_preferences
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_metrics' 
        AND policyname = 'Users can view own metrics'
    ) THEN
        CREATE POLICY "Users can view own metrics"
            ON user_metrics
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_metrics' 
        AND policyname = 'Users can insert own metrics'
    ) THEN
        CREATE POLICY "Users can insert own metrics"
            ON user_metrics
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Create user_id index if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'user_metrics' 
        AND indexname = 'idx_user_metrics_user_id'
    ) THEN
        CREATE INDEX idx_user_metrics_user_id ON user_metrics(user_id);
    END IF;
END $$;