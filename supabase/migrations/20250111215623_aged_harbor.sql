/*
  # Initial Schema Setup

  1. New Tables
    - `dashboard_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `layout` (jsonb)
      - `theme` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_metrics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `metric_name` (text)
      - `metric_value` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own data
*/

-- Dashboard Preferences Table
CREATE TABLE IF NOT EXISTS dashboard_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    layout jsonb DEFAULT '{}',
    theme text DEFAULT 'light',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- User Metrics Table
CREATE TABLE IF NOT EXISTS user_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    metric_name text NOT NULL,
    metric_value numeric NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE dashboard_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for dashboard_preferences
CREATE POLICY "Users can view own dashboard preferences"
    ON dashboard_preferences
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dashboard preferences"
    ON dashboard_preferences
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dashboard preferences"
    ON dashboard_preferences
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies for user_metrics
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

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_metrics_user_id ON user_metrics(user_id);