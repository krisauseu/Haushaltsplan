-- Migration: Add user authentication and Row Level Security
-- Run this in the Supabase SQL Editor

-- =====================================================
-- STEP 1: Add user_id column to categories
-- =====================================================
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- =====================================================
-- STEP 2: Add user_id column to monthly_values
-- =====================================================
ALTER TABLE monthly_values 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- =====================================================
-- STEP 3: Create indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_values_user_id ON monthly_values(user_id);

-- =====================================================
-- STEP 4: Enable RLS on both tables
-- =====================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_values ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: Create RLS policies for categories
-- =====================================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;

-- Create new policies
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- STEP 6: Create RLS policies for monthly_values
-- =====================================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view own values" ON monthly_values;
DROP POLICY IF EXISTS "Users can insert own values" ON monthly_values;
DROP POLICY IF EXISTS "Users can update own values" ON monthly_values;
DROP POLICY IF EXISTS "Users can delete own values" ON monthly_values;

-- Create new policies
CREATE POLICY "Users can view own values" ON monthly_values
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own values" ON monthly_values
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own values" ON monthly_values
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own values" ON monthly_values
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- NOTE: After your first user (kristian) registers,
-- run the following to assign existing data to them:
-- 
-- UPDATE categories SET user_id = '<kristian_user_uuid>' WHERE user_id IS NULL;
-- UPDATE monthly_values SET user_id = '<kristian_user_uuid>' WHERE user_id IS NULL;
-- =====================================================
