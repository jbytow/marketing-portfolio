-- Add case study content fields to posts
-- These replace the is_case_study boolean with actual structured content

ALTER TABLE posts ADD COLUMN case_study_challenge_en TEXT;
ALTER TABLE posts ADD COLUMN case_study_challenge_pl TEXT;
ALTER TABLE posts ADD COLUMN case_study_solution_en TEXT;
ALTER TABLE posts ADD COLUMN case_study_solution_pl TEXT;
ALTER TABLE posts ADD COLUMN case_study_results_en TEXT;
ALTER TABLE posts ADD COLUMN case_study_results_pl TEXT;
ALTER TABLE posts ADD COLUMN case_study_testimonial_en TEXT;
ALTER TABLE posts ADD COLUMN case_study_testimonial_pl TEXT;
ALTER TABLE posts ADD COLUMN case_study_testimonial_author VARCHAR(255);

-- Remove the old is_case_study column
ALTER TABLE posts DROP COLUMN is_case_study;
