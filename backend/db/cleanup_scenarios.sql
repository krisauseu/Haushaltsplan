-- Clean up script for scenario tables
-- Run this in Supabase SQL Editor to fix duplicate key issues

-- Delete all existing scenario values (from old attempts)
DELETE FROM scenario_values;

-- Delete all existing scenarios (from old attempts)
DELETE FROM scenarios;

-- Verify cleanup
SELECT COUNT(*) as scenario_count FROM scenarios;
SELECT COUNT(*) as scenario_values_count FROM scenario_values;
