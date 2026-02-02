-- Add footer-specific fields to site_settings
ALTER TABLE site_settings ADD COLUMN footer_title_en VARCHAR(255);
ALTER TABLE site_settings ADD COLUMN footer_title_pl VARCHAR(255);
ALTER TABLE site_settings ADD COLUMN footer_tagline_en TEXT;
ALTER TABLE site_settings ADD COLUMN footer_tagline_pl TEXT;

-- Set default values from hero fields
UPDATE site_settings SET
    footer_title_en = hero_title_en,
    footer_title_pl = hero_title_pl,
    footer_tagline_en = hero_subtitle_en,
    footer_tagline_pl = hero_subtitle_pl;
