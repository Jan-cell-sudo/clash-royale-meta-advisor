-- First, update uploads table to use simplified league names
UPDATE uploads SET league = 'Bronze' WHERE league IN ('Bronze I', 'Bronze II', 'Bronze III');
UPDATE uploads SET league = 'Silver' WHERE league IN ('Silver I', 'Silver II', 'Silver III');
UPDATE uploads SET league = 'Gold' WHERE league IN ('Gold I', 'Gold II', 'Gold III');

-- Delete the duplicate leagues first, keeping only one per tier
DELETE FROM leagues WHERE id IN (2, 3, 5, 6, 8, 9);

-- Now update the names of the remaining leagues
UPDATE leagues SET name = 'Bronze', min_trophies = 0, max_trophies = 599 WHERE id = 1;
UPDATE leagues SET name = 'Silver', min_trophies = 600, max_trophies = 1199 WHERE id = 4;
UPDATE leagues SET name = 'Gold', min_trophies = 1200, max_trophies = 2499 WHERE id = 7;

-- Refresh the materialized view to reflect changes
REFRESH MATERIALIZED VIEW league_usage;