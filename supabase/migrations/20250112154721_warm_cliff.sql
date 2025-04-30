/*
  # Add period column to marketing_budgets table

  1. Changes
    - Add period column to marketing_budgets table with type check constraint
    - Add index for better query performance
  
  2. Security
    - No changes to RLS policies needed
*/

DO $$ 
BEGIN
    -- Add period column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketing_budgets' 
        AND column_name = 'period'
    ) THEN
        ALTER TABLE marketing_budgets 
        ADD COLUMN period text NOT NULL 
        CHECK (period IN ('monthly', 'quarterly', 'yearly'));

        -- Create index for period column
        CREATE INDEX IF NOT EXISTS idx_marketing_budgets_period 
        ON marketing_budgets(period);
    END IF;
END $$;