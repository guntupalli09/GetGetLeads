/*
  # Fix RLS policies for user metrics

  1. Changes
    - Drop and recreate all policies for user_metrics table to ensure clean state
    - Add comprehensive RLS policies for all operations
  
  2. Security
    - Ensures users can only access their own metrics
    - Provides explicit policies for SELECT and INSERT operations
*/

-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own metrics" ON user_metrics;
    DROP POLICY IF EXISTS "Users can insert own metrics" ON user_metrics;
END $$;

-- Recreate policies with proper permissions
CREATE POLICY "Users can view own metrics"
    ON user_metrics
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics"
    ON user_metrics
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;