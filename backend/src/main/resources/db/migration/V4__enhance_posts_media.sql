-- V4__enhance_posts_media.sql
-- Enhance posts with hashtags and media with ordering/YouTube support

-- Add hashtags to posts (text array with GIN index for fast containment queries)
ALTER TABLE posts ADD COLUMN hashtags TEXT[] DEFAULT '{}';
CREATE INDEX idx_posts_hashtags ON posts USING GIN (hashtags);

-- Add display_order and video_url to media
ALTER TABLE media ADD COLUMN display_order INTEGER DEFAULT 0;
ALTER TABLE media ADD COLUMN video_url VARCHAR(500);

-- Allow nullable fields for YouTube type (no file upload needed)
ALTER TABLE media ALTER COLUMN filename DROP NOT NULL;
ALTER TABLE media ALTER COLUMN original_name DROP NOT NULL;
ALTER TABLE media ALTER COLUMN mime_type DROP NOT NULL;
ALTER TABLE media ALTER COLUMN size DROP NOT NULL;

-- Update media type constraint to include YOUTUBE
ALTER TABLE media DROP CONSTRAINT IF EXISTS media_type_check;
ALTER TABLE media ADD CONSTRAINT media_type_check
    CHECK (type IN ('IMAGE', 'VIDEO', 'PDF', 'YOUTUBE'));

-- Drop campaign_details and case_study_details tables
DROP TABLE IF EXISTS campaign_details CASCADE;
DROP TABLE IF EXISTS case_study_details CASCADE;
