-- Create newsletters table
CREATE TABLE newsletters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title_en VARCHAR(255) NOT NULL,
    title_pl VARCHAR(255) NOT NULL,
    content_en TEXT,
    content_pl TEXT,
    image1 VARCHAR(500),
    image2 VARCHAR(500),
    image3 VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for ordering
CREATE INDEX idx_newsletters_display_order ON newsletters(display_order);
CREATE INDEX idx_newsletters_published ON newsletters(published);
