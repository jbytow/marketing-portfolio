-- Create skill_categories table
CREATE TABLE skill_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en VARCHAR(255) NOT NULL,
    name_pl VARCHAR(255) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default categories
INSERT INTO skill_categories (name_en, name_pl, display_order) VALUES
    ('Content & Video Creation', 'Tworzenie treści i wideo', 1),
    ('AI-Driven Content Production', 'Produkcja treści z AI', 2),
    ('SM, Influence & Brand Communication', 'SM, Influence i komunikacja marki', 3),
    ('SEO, Email', 'SEO, Email', 4),
    ('Soft Skills', 'Umiejętności miękkie', 5);

-- Add category_id to soft_skills
ALTER TABLE soft_skills ADD COLUMN category_id UUID REFERENCES skill_categories(id) ON DELETE SET NULL;

-- Set existing skills to "Soft Skills" category
UPDATE soft_skills SET category_id = (SELECT id FROM skill_categories WHERE name_en = 'Soft Skills');
