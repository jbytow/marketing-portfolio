-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Category enum type
CREATE TYPE category_type AS ENUM (
    'ABOUT_ME',
    'EXPERIENCE',
    'CAMPAIGNS',
    'INFLUENCE_MARKETING',
    'CASE_STUDY',
    'CONTENT_COPY',
    'SOFT_SKILLS'
);

-- Media type enum
CREATE TYPE media_type AS ENUM ('IMAGE', 'VIDEO', 'PDF');

-- Posts table (base table for all content)
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category category_type NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_pl VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt_en TEXT,
    excerpt_pl TEXT,
    content_en JSONB,
    content_pl JSONB,
    featured_image VARCHAR(500),
    published BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_display_order ON posts(display_order);

-- Experience details table
CREATE TABLE experience_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    role_en VARCHAR(255) NOT NULL,
    role_pl VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    achievements_en JSONB,
    achievements_pl JSONB
);

-- Campaign details table
CREATE TABLE campaign_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
    client_name VARCHAR(255),
    project_type_en VARCHAR(255),
    project_type_pl VARCHAR(255),
    results_en JSONB,
    results_pl JSONB,
    metrics JSONB
);

-- Case study details table
CREATE TABLE case_study_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
    problem_en TEXT,
    problem_pl TEXT,
    solution_en TEXT,
    solution_pl TEXT,
    results_en TEXT,
    results_pl TEXT,
    metrics JSONB,
    testimonial_text_en TEXT,
    testimonial_text_pl TEXT,
    testimonial_author VARCHAR(255)
);

-- Influence marketing details table
CREATE TABLE influence_marketing_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
    partnership_type_en VARCHAR(255),
    partnership_type_pl VARCHAR(255),
    community_size INTEGER,
    engagement_rate DECIMAL(5, 2),
    platforms JSONB
);

-- Media table
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    type media_type NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    url VARCHAR(500) NOT NULL,
    alt_text_en VARCHAR(255),
    alt_text_pl VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_post_id ON media(post_id);
CREATE INDEX idx_media_type ON media(type);

-- Site settings table (singleton)
CREATE TABLE site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    hero_title_en VARCHAR(255),
    hero_title_pl VARCHAR(255),
    hero_subtitle_en TEXT,
    hero_subtitle_pl TEXT,
    about_text_en TEXT,
    about_text_pl TEXT,
    profile_image VARCHAR(500),
    email VARCHAR(255),
    phone VARCHAR(50),
    social_links JSONB,
    meta_description_en TEXT,
    meta_description_pl TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default site settings
INSERT INTO site_settings (
    hero_title_en,
    hero_title_pl,
    hero_subtitle_en,
    hero_subtitle_pl,
    meta_description_en,
    meta_description_pl
) VALUES (
    'Marketing Professional',
    'Specjalista ds. Marketingu',
    'Creating impactful campaigns and building brand stories',
    'Tworzenie skutecznych kampanii i budowanie historii marek',
    'Professional marketing portfolio showcasing campaigns, case studies, and expertise',
    'Profesjonalne portfolio marketingowe prezentujace kampanie, case studies i doswiadczenie'
);

-- Users table for OAuth sessions
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    avatar_url VARCHAR(500),
    provider VARCHAR(50) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
