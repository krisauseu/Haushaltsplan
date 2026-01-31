-- =====================================================
-- Haushaltsplan - Scenarios Feature Migration (Clean Approach)
-- =====================================================
-- This script creates a SEPARATE table for scenario values
-- monthly_values remains unchanged for live data safety
-- =====================================================

-- =====================================================
-- STEP 1: scenarios table (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT scenarios_name_not_empty CHECK (length(trim(name)) > 0)
);

-- =====================================================
-- STEP 2: NEW separate table for scenario values
-- =====================================================

CREATE TABLE IF NOT EXISTS scenario_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    amount NUMERIC(10, 2) DEFAULT 0,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT scenario_values_unique UNIQUE (scenario_id, category_id, year, month)
);

-- =====================================================
-- STEP 3: Indexes for scenarios
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_scenarios_user_id ON scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_user_year ON scenarios(user_id, year);

-- =====================================================
-- STEP 4: Indexes for scenario_values
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_scenario_values_scenario_id ON scenario_values(scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenario_values_category_id ON scenario_values(category_id);
CREATE INDEX IF NOT EXISTS idx_scenario_values_year ON scenario_values(year);
CREATE INDEX IF NOT EXISTS idx_scenario_values_user_id ON scenario_values(user_id);

-- =====================================================
-- STEP 5: RLS for scenarios
-- =====================================================

ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can insert own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can update own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can delete own scenarios" ON scenarios;

CREATE POLICY "Users can view own scenarios" ON scenarios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scenarios" ON scenarios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scenarios" ON scenarios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scenarios" ON scenarios
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- STEP 6: RLS for scenario_values
-- =====================================================

ALTER TABLE scenario_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own scenario values" ON scenario_values;
DROP POLICY IF EXISTS "Users can insert own scenario values" ON scenario_values;
DROP POLICY IF EXISTS "Users can update own scenario values" ON scenario_values;
DROP POLICY IF EXISTS "Users can delete own scenario values" ON scenario_values;

CREATE POLICY "Users can view own scenario values" ON scenario_values
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scenario values" ON scenario_values
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scenario values" ON scenario_values
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scenario values" ON scenario_values
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- DONE!
-- =====================================================
-- After running this script:
-- 1. scenarios table exists with RLS
-- 2. scenario_values table exists (separate from monthly_values)
-- 3. monthly_values is UNCHANGED - live data is safe
-- 4. Standard UNIQUE constraint works perfectly
-- =====================================================
