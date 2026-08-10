-- Admin toggle: force the Rose theme's decorative animations even when the
-- visitor's browser/OS requests prefers-reduced-motion.
ALTER TABLE site_settings ADD COLUMN rose_force_motion BOOLEAN NOT NULL DEFAULT FALSE;
