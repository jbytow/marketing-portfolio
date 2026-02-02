-- Add about tags to site_settings
ALTER TABLE site_settings ADD COLUMN about_tags_en TEXT[] DEFAULT ARRAY['Marketing Strategy', 'Brand Development', 'Content Creation', 'Social Media', 'Analytics'];
ALTER TABLE site_settings ADD COLUMN about_tags_pl TEXT[] DEFAULT ARRAY['Strategia Marketingowa', 'Rozwój Marki', 'Tworzenie Treści', 'Media Społecznościowe', 'Analityka'];

-- Create interests table
CREATE TABLE interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_en VARCHAR(255) NOT NULL,
    title_pl VARCHAR(255) NOT NULL,
    image1 VARCHAR(500),
    image2 VARCHAR(500),
    image3 VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
