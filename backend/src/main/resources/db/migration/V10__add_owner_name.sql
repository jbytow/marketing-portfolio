-- Add owner name field to site_settings
ALTER TABLE site_settings ADD COLUMN owner_name VARCHAR(255) DEFAULT 'Natalia Zakulecka';
