-- Schema für Haushaltsplan-Datenbank

-- Kategorien-Tabelle
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    is_fixed BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monatswerte-Tabelle
CREATE TABLE IF NOT EXISTS monthly_values (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    amount DECIMAL(10,2) DEFAULT 0,
    UNIQUE(category_id, year, month)
);

-- Index für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_monthly_values_year ON monthly_values(year);
CREATE INDEX IF NOT EXISTS idx_monthly_values_category ON monthly_values(category_id);

-- =====================================================
-- SEED DATA - Einnahmen (Income)
-- =====================================================

INSERT INTO categories (name, type, is_fixed, display_order) VALUES
    ('Erwerbsminderungsrente', 'income', true, 1),
    ('Grundsicherung', 'income', true, 2),
    ('Wohngeld', 'income', true, 3),
    ('Pflegegeld', 'income', true, 4),
    ('Verhinderungspflege', 'income', true, 5);

-- =====================================================
-- SEED DATA - Ausgaben Fix (Fixed Expenses)
-- =====================================================

INSERT INTO categories (name, type, is_fixed, display_order) VALUES
    ('Miete', 'expense', true, 10),
    ('Strom', 'expense', true, 11),
    ('Gas/Heizung', 'expense', true, 12),
    ('Versicherungen', 'expense', true, 13),
    ('Internet', 'expense', true, 14),
    ('Servermiete', 'expense', true, 15),
    ('ChatGPT / Google AI Pro', 'expense', true, 16),
    ('GEZ', 'expense', true, 17),
    ('Amazon Ratenkauf DJI Neo 2 Fly', 'expense', true, 18),
    ('Amazon Ratenkauf iPad Air 11"', 'expense', true, 19),
    ('Amazon Ratenkauf Roland FP-30x', 'expense', true, 20),
    ('Canva Premium', 'expense', true, 21);

-- =====================================================
-- SEED DATA - Ausgaben Variabel (Variable Expenses)
-- =====================================================

INSERT INTO categories (name, type, is_fixed, display_order) VALUES
    ('Lebensmittel Budget', 'expense', false, 30),
    ('Kleidung, Medikamente Budget', 'expense', false, 31);

-- =====================================================
-- SEED DATA - Monatswerte für 2026 basierend auf Screenshot
-- =====================================================

-- Funktion zum Einfügen von Monatswerten
DO $$
DECLARE
    cat_id INTEGER;
    yr INTEGER := 2026;
BEGIN
    -- Erwerbsminderungsrente (April-Dezember: 765.04€)
    SELECT id INTO cat_id FROM categories WHERE name = 'Erwerbsminderungsrente';
    FOR m IN 4..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 765.04);
    END LOOP;

    -- Grundsicherung (Januar-Februar: 1252.67€)
    SELECT id INTO cat_id FROM categories WHERE name = 'Grundsicherung';
    INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, 1, 1252.67);
    INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, 2, 1252.67);

    -- Wohngeld (April-Dezember: 422.00€)
    SELECT id INTO cat_id FROM categories WHERE name = 'Wohngeld';
    FOR m IN 4..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 422.00);
    END LOOP;

    -- Pflegegeld (alle Monate: 350.00€, ab März 590.00€)
    SELECT id INTO cat_id FROM categories WHERE name = 'Pflegegeld';
    INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, 1, 350.00);
    INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, 2, 350.00);
    FOR m IN 3..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 590.00);
    END LOOP;

    -- Verhinderungspflege (alle Monate: 300.00€)
    SELECT id INTO cat_id FROM categories WHERE name = 'Verhinderungspflege';
    FOR m IN 1..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 300.00);
    END LOOP;

    -- ===== AUSGABEN FIX =====

    -- Miete (alle Monate: 580.00€)
    SELECT id INTO cat_id FROM categories WHERE name = 'Miete';
    FOR m IN 1..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 580.00);
    END LOOP;

    -- Strom (alle Monate: 90.00€)
    SELECT id INTO cat_id FROM categories WHERE name = 'Strom';
    FOR m IN 1..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 90.00);
    END LOOP;

    -- Gas/Heizung (alle Monate: 112.00€)
    SELECT id INTO cat_id FROM categories WHERE name = 'Gas/Heizung';
    FOR m IN 1..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 112.00);
    END LOOP;

    -- Versicherungen (alle Monate: 18.00€)
    SELECT id INTO cat_id FROM categories WHERE name = 'Versicherungen';
    FOR m IN 1..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 18.00);
    END LOOP;

    -- Internet (alle Monate: 85.00€)
    SELECT id INTO cat_id FROM categories WHERE name = 'Internet';
    FOR m IN 1..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 85.00);
    END LOOP;

    -- Servermiete (alle Monate: 40.00€)
    SELECT id INTO cat_id FROM categories WHERE name = 'Servermiete';
    FOR m IN 1..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 40.00);
    END LOOP;

    -- ChatGPT / Google AI Pro (alle Monate: 30.00€, ab März: 22.00€)
    SELECT id INTO cat_id FROM categories WHERE name = 'ChatGPT / Google AI Pro';
    INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, 1, 30.00);
    INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, 2, 22.00);
    FOR m IN 3..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 30.00);
    END LOOP;

    -- GEZ (kein Eintrag - 0€)
    SELECT id INTO cat_id FROM categories WHERE name = 'GEZ';
    FOR m IN 1..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 0.00);
    END LOOP;

    -- Amazon Ratenkauf DJI Neo 2 Fly (Januar-April: 65.80€)
    SELECT id INTO cat_id FROM categories WHERE name = 'Amazon Ratenkauf DJI Neo 2 Fly';
    FOR m IN 1..4 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 65.80);
    END LOOP;
    FOR m IN 5..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 0.00);
    END LOOP;

    -- Amazon Ratenkauf iPad Air 11" (Januar-März: 99.80€)
    SELECT id INTO cat_id FROM categories WHERE name = 'Amazon Ratenkauf iPad Air 11"';
    FOR m IN 1..3 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 99.80);
    END LOOP;
    FOR m IN 4..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 0.00);
    END LOOP;

    -- Amazon Ratenkauf Roland FP-30x (Januar-März: 124.20€)
    SELECT id INTO cat_id FROM categories WHERE name = 'Amazon Ratenkauf Roland FP-30x';
    FOR m IN 1..3 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 124.20);
    END LOOP;
    FOR m IN 4..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 0.00);
    END LOOP;

    -- Canva Premium (alle Monate: 12.00€)
    SELECT id INTO cat_id FROM categories WHERE name = 'Canva Premium';
    FOR m IN 1..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 12.00);
    END LOOP;

    -- ===== AUSGABEN VARIABEL =====

    -- Lebensmittel Budget (alle Monate: 200.00€)
    SELECT id INTO cat_id FROM categories WHERE name = 'Lebensmittel Budget';
    FOR m IN 1..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 200.00);
    END LOOP;

    -- Kleidung, Medikamente Budget (alle Monate: 50.00€)
    SELECT id INTO cat_id FROM categories WHERE name = 'Kleidung, Medikamente Budget';
    FOR m IN 1..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount) VALUES (cat_id, yr, m, 50.00);
    END LOOP;

END $$;
