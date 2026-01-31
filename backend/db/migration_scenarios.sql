-- =====================================================
-- Haushaltsplan - Scenarios Feature Migration
-- =====================================================
-- Dieses Skript erweitert die Datenbank um Scenario-Planung
-- Führe es im Supabase SQL-Editor aus.
-- =====================================================

-- =====================================================
-- STEP 1: Neue Tabelle 'scenarios' erstellen
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
-- STEP 2: Indizes für scenarios
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_scenarios_user_id ON scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_user_year ON scenarios(user_id, year);

-- =====================================================
-- STEP 3: RLS für scenarios aktivieren
-- =====================================================

ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: RLS Policies für scenarios
-- =====================================================

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
-- STEP 5: Erweitere monthly_values Tabelle
-- =====================================================

-- Füge scenario_id Spalte hinzu (nullable, da bestehende Daten NULL haben = Live-Daten)
ALTER TABLE monthly_values 
ADD COLUMN IF NOT EXISTS scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE;

-- =====================================================
-- STEP 6: Index für scenario_id
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_monthly_values_scenario_id ON monthly_values(scenario_id);

-- =====================================================
-- STEP 7: UNIQUE Constraint aktualisieren
-- =====================================================

-- Entferne den alten Constraint (falls vorhanden)
ALTER TABLE monthly_values DROP CONSTRAINT IF EXISTS monthly_values_category_id_year_month_key;

-- Erstelle neuen Constraint der scenario_id einschließt
-- WICHTIG: NULL Werte werden bei UNIQUE unterschiedlich behandelt in PostgreSQL
-- Zwei NULL scenario_id Werte werden als unterschiedlich betrachtet für den gleichen category_id/year/month
-- Daher brauchen wir einen speziellen Constraint

-- Erstelle einen partiellen UNIQUE Index für Live-Daten (scenario_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS monthly_values_live_unique 
  ON monthly_values(category_id, year, month) 
  WHERE scenario_id IS NULL;

-- Erstelle einen UNIQUE Index für Szenario-Daten (scenario_id IS NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS monthly_values_scenario_unique 
  ON monthly_values(category_id, year, month, scenario_id) 
  WHERE scenario_id IS NOT NULL;

-- =====================================================
-- FERTIG!
-- =====================================================
-- Nach Ausführung dieses Skripts:
-- 1. Die Tabelle 'scenarios' ist verfügbar
-- 2. Nutzer können Szenarien erstellen/verwalten
-- 3. monthly_values kann jetzt Szenario-Daten speichern
-- 4. Live-Daten (scenario_id = NULL) bleiben unberührt
-- =====================================================
