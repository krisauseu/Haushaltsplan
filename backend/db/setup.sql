-- =====================================================
-- Haushaltsplan - Datenbank Setup für Supabase
-- =====================================================
-- Führe dieses Skript im Supabase SQL-Editor aus.
-- Es erstellt alle Tabellen, aktiviert RLS und fügt 
-- generische Beispielkategorien hinzu.
-- =====================================================

-- =====================================================
-- STEP 1: Tabellen erstellen
-- =====================================================

-- Kategorien-Tabelle
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    is_fixed BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monatswerte-Tabelle
CREATE TABLE IF NOT EXISTS monthly_values (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    amount DECIMAL(10,2) DEFAULT 0,
    user_id UUID REFERENCES auth.users(id),
    UNIQUE(category_id, year, month)
);

-- =====================================================
-- STEP 2: Indizes für Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_monthly_values_year ON monthly_values(year);
CREATE INDEX IF NOT EXISTS idx_monthly_values_category ON monthly_values(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_values_user_id ON monthly_values(user_id);

-- =====================================================
-- STEP 3: Row Level Security (RLS) aktivieren
-- =====================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_values ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: RLS Policies für categories
-- =====================================================

DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;

CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- STEP 5: RLS Policies für monthly_values
-- =====================================================

DROP POLICY IF EXISTS "Users can view own values" ON monthly_values;
DROP POLICY IF EXISTS "Users can insert own values" ON monthly_values;
DROP POLICY IF EXISTS "Users can update own values" ON monthly_values;
DROP POLICY IF EXISTS "Users can delete own values" ON monthly_values;

CREATE POLICY "Users can view own values" ON monthly_values
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own values" ON monthly_values
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own values" ON monthly_values
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own values" ON monthly_values
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- STEP 6: Funktion zum Erstellen von Starter-Kategorien
-- =====================================================
-- Diese Funktion wird aufgerufen wenn sich ein neuer 
-- Benutzer registriert (via Supabase Auth Trigger)
-- =====================================================

CREATE OR REPLACE FUNCTION create_starter_categories(new_user_id UUID)
RETURNS void AS $$
BEGIN
    -- Einnahmen (Income)
    INSERT INTO categories (name, type, is_fixed, display_order, user_id) VALUES
        ('Gehalt', 'income', true, 1, new_user_id),
        ('Nebenjob', 'income', true, 2, new_user_id),
        ('Kindergeld', 'income', true, 3, new_user_id),
        ('Sonstige Einnahmen', 'income', false, 4, new_user_id);

    -- Feste Ausgaben (Fixed Expenses)
    INSERT INTO categories (name, type, is_fixed, display_order, user_id) VALUES
        ('Miete', 'expense', true, 10, new_user_id),
        ('Strom', 'expense', true, 11, new_user_id),
        ('Gas/Heizung', 'expense', true, 12, new_user_id),
        ('Internet & Telefon', 'expense', true, 13, new_user_id),
        ('Versicherungen', 'expense', true, 14, new_user_id),
        ('Streaming-Dienste', 'expense', true, 15, new_user_id),
        ('Mitgliedschaften', 'expense', true, 16, new_user_id);

    -- Variable Ausgaben (Variable Expenses)
    INSERT INTO categories (name, type, is_fixed, display_order, user_id) VALUES
        ('Lebensmittel', 'expense', false, 30, new_user_id),
        ('Transport & Mobilität', 'expense', false, 31, new_user_id),
        ('Freizeit & Unterhaltung', 'expense', false, 32, new_user_id),
        ('Kleidung', 'expense', false, 33, new_user_id),
        ('Gesundheit & Medikamente', 'expense', false, 34, new_user_id),
        ('Sonstige Ausgaben', 'expense', false, 35, new_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 7: Auth Trigger für automatische Kategorien
-- =====================================================
-- Dieser Trigger erstellt automatisch Starter-Kategorien
-- wenn sich ein neuer Benutzer registriert.
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    PERFORM create_starter_categories(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger erstellen (falls noch nicht vorhanden)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- FERTIG!
-- =====================================================
-- Nach Ausführung dieses Skripts:
-- 1. Gehe zu Authentication > Providers in Supabase
-- 2. Aktiviere "Email" Provider
-- 3. Optional: Deaktiviere "Confirm email" für einfacheres Testing
-- 4. Registriere einen neuen Benutzer in der App
-- 5. Die Starter-Kategorien werden automatisch erstellt!
-- =====================================================
