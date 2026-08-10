-- Rose animations should show by default now; existing row gets flipped too.
ALTER TABLE site_settings ALTER COLUMN rose_force_motion SET DEFAULT TRUE;
UPDATE site_settings SET rose_force_motion = TRUE WHERE id = 1;
