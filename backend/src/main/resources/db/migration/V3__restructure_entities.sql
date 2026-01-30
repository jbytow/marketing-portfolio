-- V3__restructure_entities.sql
-- Restructure entities: add soft_skills, experiences tables, is_case_study flag, remove old tables

-- Create soft_skills table
CREATE TABLE soft_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_pl VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_pl TEXT,
    professional_usage_en TEXT,
    professional_usage_pl TEXT,
    icon VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_soft_skills_display_order ON soft_skills(display_order);

-- Create experiences table
CREATE TABLE experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_en VARCHAR(255) NOT NULL,
    title_pl VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    role_en VARCHAR(255) NOT NULL,
    role_pl VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    description_en TEXT,
    description_pl TEXT,
    achievements_en JSONB,
    achievements_pl JSONB,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_experiences_display_order ON experiences(display_order);
CREATE INDEX idx_experiences_start_date ON experiences(start_date);

-- Add is_case_study column to posts
ALTER TABLE posts ADD COLUMN is_case_study BOOLEAN DEFAULT FALSE;
CREATE INDEX idx_posts_is_case_study ON posts(is_case_study);

-- Migrate existing CASE_STUDY posts: set is_case_study flag and change category to CAMPAIGNS
UPDATE posts
SET is_case_study = TRUE,
    category = 'CAMPAIGNS'
WHERE category = 'CASE_STUDY';

-- Migrate existing EXPERIENCE posts data to new experiences table
INSERT INTO experiences (title_en, title_pl, company, role_en, role_pl, start_date, end_date, description_en, description_pl, achievements_en, achievements_pl, display_order)
SELECT
    p.title_en,
    p.title_pl,
    COALESCE(ed.company_name, 'Unknown Company'),
    COALESCE(ed.role_en, p.title_en),
    COALESCE(ed.role_pl, p.title_pl),
    COALESCE(ed.start_date, CURRENT_DATE),
    ed.end_date,
    p.excerpt_en,
    p.excerpt_pl,
    ed.achievements_en,
    ed.achievements_pl,
    p.display_order
FROM posts p
LEFT JOIN experience_details ed ON ed.post_id = p.id
WHERE p.category = 'EXPERIENCE';

-- Delete old EXPERIENCE posts (data has been migrated to experiences table)
DELETE FROM posts WHERE category = 'EXPERIENCE';

-- Delete old SOFT_SKILLS posts
DELETE FROM posts WHERE category = 'SOFT_SKILLS';

-- Delete old INFLUENCE_MARKETING posts
DELETE FROM posts WHERE category = 'INFLUENCE_MARKETING';

-- Drop foreign key constraints first (for experience_details and influence_marketing_details)
DROP TABLE IF EXISTS experience_details CASCADE;
DROP TABLE IF EXISTS influence_marketing_details CASCADE;

-- Create triggers for updated_at on new tables
CREATE TRIGGER update_soft_skills_updated_at
    BEFORE UPDATE ON soft_skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at
    BEFORE UPDATE ON experiences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
