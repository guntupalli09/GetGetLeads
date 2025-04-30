/*
  # Fix RLS policies for user metrics

  1. Changes
    - Add INSERT policy for user_metrics table to allow authenticated users to insert their own metrics
  
  2. Security
    - Ensures users can only insert metrics for their own user_id
*/

-- Add INSERT policy for user_metrics if it doesn't exist
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