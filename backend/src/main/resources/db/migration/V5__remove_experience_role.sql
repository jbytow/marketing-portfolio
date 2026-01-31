-- Remove redundant role columns from experiences table
-- Title already serves the same purpose as role

ALTER TABLE experiences DROP COLUMN IF EXISTS role_en;
ALTER TABLE experiences DROP COLUMN IF EXISTS role_pl;
