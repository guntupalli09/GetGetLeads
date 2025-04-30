/*
  # Add recorded_at column to user_metrics table

  1. Changes
    - Add recorded_at column to user_metrics table
    - Create index on recorded_at for faster queries
*/

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_metrics' 
        AND column_name = 'recorded_at'
    ) THEN
        ALTER TABLE user_metrics ADD COLUMN recorded_at timestamptz DEFAULT now();
        CREATE INDEX idx_user_metrics_recorded_at ON user_metrics(recorded_at);
    END IF;
END $$;