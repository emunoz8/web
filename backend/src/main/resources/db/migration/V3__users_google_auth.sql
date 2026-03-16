-- ==========================================
-- V3: Google authentication identity support
-- ==========================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_sub VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_google_sub
  ON users(google_sub)
  WHERE google_sub IS NOT NULL;
