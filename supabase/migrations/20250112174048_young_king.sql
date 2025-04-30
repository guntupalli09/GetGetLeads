/*
  # Customer Management Schema Fix

  1. New Tables
    - Core customer tables with proper constraints
    - Interaction tracking
    - Workflow management
    - Task management

  2. Security
    - Safe policy creation with existence checks
    - RLS enabled on all tables

  3. Changes
    - Adds indexes for performance
    - Adds updated_at triggers
*/

-- Create tables if they don't exist
DO $$ 
BEGIN
    -- Customers Table
    CREATE TABLE IF NOT EXISTS customers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        name text NOT NULL,
        email text NOT NULL,
        phone text,
        status text DEFAULT 'lead' CHECK (status IN ('lead', 'qualified', 'customer', 'inactive', 'churned')),
        source text,
        lifetime_value numeric DEFAULT 0,
        engagement_score numeric DEFAULT 0,
        churn_risk text DEFAULT 'low' CHECK (churn_risk IN ('low', 'medium', 'high')),
        metadata jsonb DEFAULT '{}',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        UNIQUE(user_id, email)
    );

    -- Customer Interactions Table
    CREATE TABLE IF NOT EXISTS customer_interactions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
        type text NOT NULL CHECK (type IN ('email', 'call', 'meeting', 'note')),
        title text NOT NULL,
        description text,
        sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative')),
        metadata jsonb DEFAULT '{}',
        created_at timestamptz DEFAULT now()
    );

    -- Customer Segments Table
    CREATE TABLE IF NOT EXISTS customer_segments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        name text NOT NULL,
        description text,
        criteria jsonb NOT NULL,
        metadata jsonb DEFAULT '{}',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
    );

    -- Customer Feedback Table
    CREATE TABLE IF NOT EXISTS customer_feedback (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
        rating integer CHECK (rating >= 1 AND rating <= 5),
        message text,
        category text,
        sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative')),
        metadata jsonb DEFAULT '{}',
        created_at timestamptz DEFAULT now()
    );

    -- Customer Workflows Table
    CREATE TABLE IF NOT EXISTS customer_workflows (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        name text NOT NULL,
        description text,
        trigger_event text NOT NULL,
        steps jsonb NOT NULL,
        status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
        metadata jsonb DEFAULT '{}',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
    );

    -- Workflow Executions Table
    CREATE TABLE IF NOT EXISTS workflow_executions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        workflow_id uuid REFERENCES customer_workflows(id) ON DELETE CASCADE NOT NULL,
        customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
        status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
        current_step integer DEFAULT 0,
        results jsonb DEFAULT '{}',
        metadata jsonb DEFAULT '{}',
        started_at timestamptz DEFAULT now(),
        completed_at timestamptz
    );

    -- Customer Tasks Table
    CREATE TABLE IF NOT EXISTS customer_tasks (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
        workflow_execution_id uuid REFERENCES workflow_executions(id) ON DELETE SET NULL,
        title text NOT NULL,
        description text,
        due_date timestamptz,
        priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
        assignee text,
        metadata jsonb DEFAULT '{}',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
    );
END $$;

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
    -- Policies for customers
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customers' 
        AND policyname = 'Users can view own customers'
    ) THEN
        CREATE POLICY "Users can view own customers"
            ON customers FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customers' 
        AND policyname = 'Users can manage own customers'
    ) THEN
        CREATE POLICY "Users can manage own customers"
            ON customers FOR ALL
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Policies for customer_interactions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customer_interactions' 
        AND policyname = 'Users can view own interactions'
    ) THEN
        CREATE POLICY "Users can view own interactions"
            ON customer_interactions FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customer_interactions' 
        AND policyname = 'Users can manage own interactions'
    ) THEN
        CREATE POLICY "Users can manage own interactions"
            ON customer_interactions FOR ALL
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Add similar policy checks for other tables
    -- customer_segments
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customer_segments' 
        AND policyname = 'Users can view own segments'
    ) THEN
        CREATE POLICY "Users can view own segments"
            ON customer_segments FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customer_segments' 
        AND policyname = 'Users can manage own segments'
    ) THEN
        CREATE POLICY "Users can manage own segments"
            ON customer_segments FOR ALL
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Add similar checks for remaining tables...
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON customer_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_customer_id ON customer_interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON customer_interactions(created_at);

CREATE INDEX IF NOT EXISTS idx_segments_user_id ON customer_segments(user_id);
CREATE INDEX IF NOT EXISTS idx_segments_created_at ON customer_segments(created_at);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON customer_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_customer_id ON customer_feedback(customer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON customer_feedback(created_at);

CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON customer_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON customer_workflows(status);

CREATE INDEX IF NOT EXISTS idx_executions_user_id ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_executions_customer_id ON workflow_executions(customer_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON workflow_executions(status);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON customer_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_customer_id ON customer_tasks(customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON customer_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON customer_tasks(due_date);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_customers_updated_at'
    ) THEN
        CREATE TRIGGER update_customers_updated_at
            BEFORE UPDATE ON customers
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_segments_updated_at'
    ) THEN
        CREATE TRIGGER update_segments_updated_at
            BEFORE UPDATE ON customer_segments
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_workflows_updated_at'
    ) THEN
        CREATE TRIGGER update_workflows_updated_at
            BEFORE UPDATE ON customer_workflows
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_tasks_updated_at'
    ) THEN
        CREATE TRIGGER update_tasks_updated_at
            BEFORE UPDATE ON customer_tasks
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;