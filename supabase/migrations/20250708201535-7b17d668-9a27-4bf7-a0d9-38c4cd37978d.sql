-- Update leagues table to use simplified names
UPDATE leagues SET name = 'Bronze' WHERE name IN ('Bronze I', 'Bronze II', 'Bronze III');
UPDATE leagues SET name = 'Silver' WHERE name IN ('Silver I', 'Silver II', 'Silver III');
UPDATE leagues SET name = 'Gold' WHERE name IN ('Gold I', 'Gold II', 'Gold III');

-- Remove duplicate leagues, keeping only one per tier with combined trophy ranges
DELETE FROM leagues WHERE id IN (2, 3, 5, 6, 8, 9);

-- Update the remaining leagues with combined trophy ranges
UPDATE leagues SET min_trophies = 0, max_trophies = 599 WHERE name = 'Bronze';
UPDATE leagues SET min_trophies = 600, max_trophies = 1199 WHERE name = 'Silver';
UPDATE leagues SET min_trophies = 1200, max_trophies = 2499 WHERE name = 'Gold';

-- Update uploads table to use simplified league names
UPDATE uploads SET league = 'Bronze' WHERE league IN ('Bronze I', 'Bronze II', 'Bronze III');
UPDATE uploads SET league = 'Silver' WHERE league IN ('Silver I', 'Silver II', 'Silver III');
UPDATE uploads SET league = 'Gold' WHERE league IN ('Gold I', 'Gold II', 'Gold III');

-- Refresh the materialized view to reflect changes
REFRESH MATERIALIZED VIEW league_usage;