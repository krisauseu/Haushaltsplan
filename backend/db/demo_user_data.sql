-- =====================================================
-- Demo-Benutzer Daten für Haushaltsplan
-- =====================================================
-- 
-- ANLEITUNG:
-- 1. Gehe zu Supabase Dashboard > Authentication > Users
-- 2. Klicke "Add user" > "Create new user"
-- 3. E-Mail: demo@haushaltsplan.de
-- 4. Passwort: demo1234
-- 5. Aktiviere "Auto Confirm User"
-- 6. Kopiere die UUID des erstellten Benutzers
-- 7. Ersetze unten '<DEMO_USER_UUID>' mit der echten UUID
-- 8. Führe dieses Skript im SQL Editor aus
--
-- =====================================================

-- Setze hier die UUID des Demo-Benutzers ein:
DO $$
DECLARE
    demo_user_id UUID := 'DEMO_USER_UUID'; -- Demo-User UUID
    cat_id INTEGER;
    current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;
BEGIN

    -- =====================================================
    -- EINNAHMEN (Income)
    -- =====================================================
    
    INSERT INTO categories (name, type, is_fixed, display_order, user_id) VALUES
        ('Gehalt', 'income', true, 1, demo_user_id),
        ('Nebenjob', 'income', true, 2, demo_user_id),
        ('Kindergeld', 'income', true, 3, demo_user_id)
    ON CONFLICT DO NOTHING;

    -- Gehalt: 2.800€ pro Monat
    SELECT id INTO cat_id FROM categories WHERE name = 'Gehalt' AND user_id = demo_user_id;
    FOR m IN 1..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount, user_id) 
        VALUES (cat_id, current_year, m, 2800.00, demo_user_id)
        ON CONFLICT (category_id, year, month) DO UPDATE SET amount = EXCLUDED.amount;
    END LOOP;

    -- Nebenjob: 400€ in einigen Monaten
    SELECT id INTO cat_id FROM categories WHERE name = 'Nebenjob' AND user_id = demo_user_id;
    INSERT INTO monthly_values (category_id, year, month, amount, user_id) VALUES
        (cat_id, current_year, 3, 400.00, demo_user_id),
        (cat_id, current_year, 6, 400.00, demo_user_id),
        (cat_id, current_year, 9, 400.00, demo_user_id),
        (cat_id, current_year, 12, 400.00, demo_user_id)
    ON CONFLICT (category_id, year, month) DO UPDATE SET amount = EXCLUDED.amount;

    -- Kindergeld: 250€ pro Monat
    SELECT id INTO cat_id FROM categories WHERE name = 'Kindergeld' AND user_id = demo_user_id;
    FOR m IN 1..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount, user_id) 
        VALUES (cat_id, current_year, m, 250.00, demo_user_id)
        ON CONFLICT (category_id, year, month) DO UPDATE SET amount = EXCLUDED.amount;
    END LOOP;

    -- =====================================================
    -- FESTE AUSGABEN (Fixed Expenses)
    -- =====================================================
    
    INSERT INTO categories (name, type, is_fixed, display_order, user_id) VALUES
        ('Miete', 'expense', true, 10, demo_user_id),
        ('Strom', 'expense', true, 11, demo_user_id),
        ('Gas/Heizung', 'expense', true, 12, demo_user_id),
        ('Internet & Telefon', 'expense', true, 13, demo_user_id),
        ('Versicherungen', 'expense', true, 14, demo_user_id),
        ('Streaming-Dienste', 'expense', true, 15, demo_user_id),
        ('Fitnessstudio', 'expense', true, 16, demo_user_id)
    ON CONFLICT DO NOTHING;

    -- Miete: 950€ pro Monat
    SELECT id INTO cat_id FROM categories WHERE name = 'Miete' AND user_id = demo_user_id;
    FOR m IN 1..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount, user_id) 
        VALUES (cat_id, current_year, m, 950.00, demo_user_id)
        ON CONFLICT (category_id, year, month) DO UPDATE SET amount = EXCLUDED.amount;
    END LOOP;

    -- Strom: 85€ pro Monat
    SELECT id INTO cat_id FROM categories WHERE name = 'Strom' AND user_id = demo_user_id;
    FOR m IN 1..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount, user_id) 
        VALUES (cat_id, current_year, m, 85.00, demo_user_id)
        ON CONFLICT (category_id, year, month) DO UPDATE SET amount = EXCLUDED.amount;
    END LOOP;

    -- Gas/Heizung: 120€ pro Monat (Winter mehr)
    SELECT id INTO cat_id FROM categories WHERE name = 'Gas/Heizung' AND user_id = demo_user_id;
    INSERT INTO monthly_values (category_id, year, month, amount, user_id) VALUES
        (cat_id, current_year, 1, 180.00, demo_user_id),
        (cat_id, current_year, 2, 160.00, demo_user_id),
        (cat_id, current_year, 3, 120.00, demo_user_id),
        (cat_id, current_year, 4, 80.00, demo_user_id),
        (cat_id, current_year, 5, 50.00, demo_user_id),
        (cat_id, current_year, 6, 40.00, demo_user_id),
        (cat_id, current_year, 7, 40.00, demo_user_id),
        (cat_id, current_year, 8, 40.00, demo_user_id),
        (cat_id, current_year, 9, 60.00, demo_user_id),
        (cat_id, current_year, 10, 100.00, demo_user_id),
        (cat_id, current_year, 11, 140.00, demo_user_id),
        (cat_id, current_year, 12, 180.00, demo_user_id)
    ON CONFLICT (category_id, year, month) DO UPDATE SET amount = EXCLUDED.amount;

    -- Internet & Telefon: 65€ pro Monat
    SELECT id INTO cat_id FROM categories WHERE name = 'Internet & Telefon' AND user_id = demo_user_id;
    FOR m IN 1..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount, user_id) 
        VALUES (cat_id, current_year, m, 65.00, demo_user_id)
        ON CONFLICT (category_id, year, month) DO UPDATE SET amount = EXCLUDED.amount;
    END LOOP;

    -- Versicherungen: 150€ pro Monat
    SELECT id INTO cat_id FROM categories WHERE name = 'Versicherungen' AND user_id = demo_user_id;
    FOR m IN 1..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount, user_id) 
        VALUES (cat_id, current_year, m, 150.00, demo_user_id)
        ON CONFLICT (category_id, year, month) DO UPDATE SET amount = EXCLUDED.amount;
    END LOOP;

    -- Streaming-Dienste: 35€ pro Monat
    SELECT id INTO cat_id FROM categories WHERE name = 'Streaming-Dienste' AND user_id = demo_user_id;
    FOR m IN 1..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount, user_id) 
        VALUES (cat_id, current_year, m, 35.00, demo_user_id)
        ON CONFLICT (category_id, year, month) DO UPDATE SET amount = EXCLUDED.amount;
    END LOOP;

    -- Fitnessstudio: 40€ pro Monat
    SELECT id INTO cat_id FROM categories WHERE name = 'Fitnessstudio' AND user_id = demo_user_id;
    FOR m IN 1..12 LOOP
        INSERT INTO monthly_values (category_id, year, month, amount, user_id) 
        VALUES (cat_id, current_year, m, 40.00, demo_user_id)
        ON CONFLICT (category_id, year, month) DO UPDATE SET amount = EXCLUDED.amount;
    END LOOP;

    -- =====================================================
    -- VARIABLE AUSGABEN (Variable Expenses)
    -- =====================================================
    
    INSERT INTO categories (name, type, is_fixed, display_order, user_id) VALUES
        ('Lebensmittel', 'expense', false, 30, demo_user_id),
        ('Transport & Tanken', 'expense', false, 31, demo_user_id),
        ('Freizeit & Ausgehen', 'expense', false, 32, demo_user_id),
        ('Kleidung', 'expense', false, 33, demo_user_id),
        ('Gesundheit', 'expense', false, 34, demo_user_id)
    ON CONFLICT DO NOTHING;

    -- Lebensmittel: ~400€ pro Monat (variiert)
    SELECT id INTO cat_id FROM categories WHERE name = 'Lebensmittel' AND user_id = demo_user_id;
    INSERT INTO monthly_values (category_id, year, month, amount, user_id) VALUES
        (cat_id, current_year, 1, 380.00, demo_user_id),
        (cat_id, current_year, 2, 420.00, demo_user_id),
        (cat_id, current_year, 3, 395.00, demo_user_id),
        (cat_id, current_year, 4, 410.00, demo_user_id),
        (cat_id, current_year, 5, 385.00, demo_user_id),
        (cat_id, current_year, 6, 440.00, demo_user_id),
        (cat_id, current_year, 7, 450.00, demo_user_id),
        (cat_id, current_year, 8, 420.00, demo_user_id),
        (cat_id, current_year, 9, 390.00, demo_user_id),
        (cat_id, current_year, 10, 405.00, demo_user_id),
        (cat_id, current_year, 11, 430.00, demo_user_id),
        (cat_id, current_year, 12, 480.00, demo_user_id)
    ON CONFLICT (category_id, year, month) DO UPDATE SET amount = EXCLUDED.amount;

    -- Transport & Tanken: ~180€ pro Monat
    SELECT id INTO cat_id FROM categories WHERE name = 'Transport & Tanken' AND user_id = demo_user_id;
    INSERT INTO monthly_values (category_id, year, month, amount, user_id) VALUES
        (cat_id, current_year, 1, 160.00, demo_user_id),
        (cat_id, current_year, 2, 175.00, demo_user_id),
        (cat_id, current_year, 3, 190.00, demo_user_id),
        (cat_id, current_year, 4, 185.00, demo_user_id),
        (cat_id, current_year, 5, 200.00, demo_user_id),
        (cat_id, current_year, 6, 220.00, demo_user_id),
        (cat_id, current_year, 7, 250.00, demo_user_id),
        (cat_id, current_year, 8, 230.00, demo_user_id),
        (cat_id, current_year, 9, 180.00, demo_user_id),
        (cat_id, current_year, 10, 170.00, demo_user_id),
        (cat_id, current_year, 11, 165.00, demo_user_id),
        (cat_id, current_year, 12, 195.00, demo_user_id)
    ON CONFLICT (category_id, year, month) DO UPDATE SET amount = EXCLUDED.amount;

    -- Freizeit & Ausgehen: ~120€ pro Monat
    SELECT id INTO cat_id FROM categories WHERE name = 'Freizeit & Ausgehen' AND user_id = demo_user_id;
    INSERT INTO monthly_values (category_id, year, month, amount, user_id) VALUES
        (cat_id, current_year, 1, 80.00, demo_user_id),
        (cat_id, current_year, 2, 95.00, demo_user_id),
        (cat_id, current_year, 3, 110.00, demo_user_id),
        (cat_id, current_year, 4, 130.00, demo_user_id),
        (cat_id, current_year, 5, 150.00, demo_user_id),
        (cat_id, current_year, 6, 180.00, demo_user_id),
        (cat_id, current_year, 7, 200.00, demo_user_id),
        (cat_id, current_year, 8, 190.00, demo_user_id),
        (cat_id, current_year, 9, 140.00, demo_user_id),
        (cat_id, current_year, 10, 100.00, demo_user_id),
        (cat_id, current_year, 11, 90.00, demo_user_id),
        (cat_id, current_year, 12, 160.00, demo_user_id)
    ON CONFLICT (category_id, year, month) DO UPDATE SET amount = EXCLUDED.amount;

    -- Kleidung: sporadisch
    SELECT id INTO cat_id FROM categories WHERE name = 'Kleidung' AND user_id = demo_user_id;
    INSERT INTO monthly_values (category_id, year, month, amount, user_id) VALUES
        (cat_id, current_year, 1, 120.00, demo_user_id),
        (cat_id, current_year, 3, 85.00, demo_user_id),
        (cat_id, current_year, 5, 150.00, demo_user_id),
        (cat_id, current_year, 7, 200.00, demo_user_id),
        (cat_id, current_year, 9, 95.00, demo_user_id),
        (cat_id, current_year, 11, 180.00, demo_user_id)
    ON CONFLICT (category_id, year, month) DO UPDATE SET amount = EXCLUDED.amount;

    -- Gesundheit: sporadisch
    SELECT id INTO cat_id FROM categories WHERE name = 'Gesundheit' AND user_id = demo_user_id;
    INSERT INTO monthly_values (category_id, year, month, amount, user_id) VALUES
        (cat_id, current_year, 2, 45.00, demo_user_id),
        (cat_id, current_year, 4, 30.00, demo_user_id),
        (cat_id, current_year, 6, 25.00, demo_user_id),
        (cat_id, current_year, 8, 60.00, demo_user_id),
        (cat_id, current_year, 10, 35.00, demo_user_id),
        (cat_id, current_year, 12, 50.00, demo_user_id)
    ON CONFLICT (category_id, year, month) DO UPDATE SET amount = EXCLUDED.amount;

    RAISE NOTICE '✅ Demo-Daten für Benutzer % erfolgreich erstellt!', demo_user_id;
    RAISE NOTICE '📊 15 Kategorien und Monatswerte für das Jahr % angelegt.', current_year;
    
END $$;

-- =====================================================
-- DEMO-BENUTZER CREDENTIALS:
-- =====================================================
-- E-Mail:    demo@haushaltsplan.de
-- Passwort:  demo1234
-- =====================================================
