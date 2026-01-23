-- Convert PostgreSQL enum columns to VARCHAR for JPA Converter compatibility

-- Convert category column
ALTER TABLE posts
    ALTER COLUMN category TYPE VARCHAR(50) USING category::text;

-- Convert media type column
ALTER TABLE media
    ALTER COLUMN type TYPE VARCHAR(20) USING type::text;

-- Drop the old enum types
DROP TYPE IF EXISTS category_type;
DROP TYPE IF EXISTS media_type;
