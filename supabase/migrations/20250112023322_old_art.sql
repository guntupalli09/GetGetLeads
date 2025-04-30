/*
  # Budget Management Schema

  1. New Tables
    - `marketing_budgets`: Track budget allocations by category and period
    - `marketing_expenses`: Track detailed expense records

  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Ensure data isolation

  3. Indexes
    - Optimize for common queries
*/

-- Create tables if they don't exist
DO $$ 
BEGIN
    -- Marketing Budgets Table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'marketing_budgets'
    ) THEN
        CREATE TABLE marketing_budgets (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            category text NOT NULL,
            amount numeric NOT NULL CHECK (amount >= 0),
            period text NOT NULL CHECK (period IN ('monthly', 'quarterly', 'yearly')),
            period_start date NOT NULL,
            period_end date NOT NULL,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            CONSTRAINT valid_period_dates CHECK (period_end >= period_start)
        );
    END IF;

    -- Marketing Expenses Table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'marketing_expenses'
    ) THEN
        CREATE TABLE marketing_expenses (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            category text NOT NULL,
            amount numeric NOT NULL CHECK (amount >= 0),
            description text,
            date date NOT NULL,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );
    END IF;
END $$;

-- Enable RLS
ALTER TABLE marketing_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_expenses ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
    -- Policies for marketing_budgets
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'marketing_budgets' 
        AND policyname = 'Users can view own budgets'
    ) THEN
        CREATE POLICY "Users can view own budgets"
            ON marketing_budgets
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'marketing_budgets' 
        AND policyname = 'Users can manage own budgets'
    ) THEN
        CREATE POLICY "Users can manage own budgets"
            ON marketing_budgets
            FOR ALL
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Policies for marketing_expenses
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'marketing_expenses' 
        AND policyname = 'Users can view own expenses'
    ) THEN
        CREATE POLICY "Users can view own expenses"
            ON marketing_expenses
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'marketing_expenses' 
        AND policyname = 'Users can manage own expenses'
    ) THEN
        CREATE POLICY "Users can manage own expenses"
            ON marketing_expenses
            FOR ALL
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Create indexes if they don't exist
DO $$ 
BEGIN
    -- Indexes for marketing_budgets
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'marketing_budgets' 
        AND indexname = 'idx_marketing_budgets_user_id'
    ) THEN
        CREATE INDEX idx_marketing_budgets_user_id ON marketing_budgets(user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'marketing_budgets' 
        AND indexname = 'idx_marketing_budgets_category'
    ) THEN
        CREATE INDEX idx_marketing_budgets_category ON marketing_budgets(category);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'marketing_budgets' 
        AND indexname = 'idx_marketing_budgets_dates'
    ) THEN
        CREATE INDEX idx_marketing_budgets_dates ON marketing_budgets(period_start, period_end);
    END IF;

    -- Indexes for marketing_expenses
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'marketing_expenses' 
        AND indexname = 'idx_marketing_expenses_user_id'
    ) THEN
        CREATE INDEX idx_marketing_expenses_user_id ON marketing_expenses(user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'marketing_expenses' 
        AND indexname = 'idx_marketing_expenses_category'
    ) THEN
        CREATE INDEX idx_marketing_expenses_category ON marketing_expenses(category);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'marketing_expenses' 
        AND indexname = 'idx_marketing_expenses_date'
    ) THEN
        CREATE INDEX idx_marketing_expenses_date ON marketing_expenses(date);
    END IF;
END $$;

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_marketing_budgets_updated_at'
    ) THEN
        CREATE TRIGGER update_marketing_budgets_updated_at
            BEFORE UPDATE ON marketing_budgets
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_marketing_expenses_updated_at'
    ) THEN
        CREATE TRIGGER update_marketing_expenses_updated_at
            BEFORE UPDATE ON marketing_expenses
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;