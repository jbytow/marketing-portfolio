-- Add site name field for header/navbar brand
ALTER TABLE site_settings ADD COLUMN site_name VARCHAR(255) DEFAULT 'Zakulecka ✨';
