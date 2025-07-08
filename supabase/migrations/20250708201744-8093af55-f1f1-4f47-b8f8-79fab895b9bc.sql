-- Clean up any remaining old league names in uploads
UPDATE uploads SET league = 'Bronze' WHERE league LIKE '%Bronze%';
UPDATE uploads SET league = 'Silver' WHERE league LIKE '%Silver%';
UPDATE uploads SET league = 'Gold' WHERE league LIKE '%Gold%';
UPDATE uploads SET league = 'Diamond' WHERE league LIKE '%Diamond%';

-- Refresh the materialized view to reflect all changes
REFRESH MATERIALIZED VIEW league_usage;