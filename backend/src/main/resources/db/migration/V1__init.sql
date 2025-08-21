-- =========================
-- V1: initial schema (PostgreSQL)
-- =========================

-- Use timestamptz for time columns (works great with Java Instant)

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id              BIGSERIAL    PRIMARY KEY,
  email           VARCHAR(255) NOT NULL UNIQUE,
  username        VARCHAR(100) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  role            VARCHAR(50)  NOT NULL,              -- e.g. USER / ADMIN
  email_verified  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- CONTENTS (parent)
--   type: 'PROJECT' | 'BLOG'
--   content_type: e.g. 'MARKDOWN', 'HTML'
CREATE TABLE IF NOT EXISTS contents (
  id            BIGSERIAL     PRIMARY KEY,
  type          VARCHAR(20)   NOT NULL CHECK (type IN ('PROJECT','BLOG')),
  content_type  VARCHAR(32)   NOT NULL,
  title         VARCHAR(255)  NOT NULL,
  slug          VARCHAR(255)  NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- PROJECTS (1:1 with contents)
CREATE TABLE IF NOT EXISTS projects (
  id           BIGINT  PRIMARY KEY REFERENCES contents(id) ON DELETE CASCADE,
  description  TEXT
);

-- BLOG POSTS (1:1 with contents)
CREATE TABLE IF NOT EXISTS blog_posts (
  id       BIGINT  PRIMARY KEY REFERENCES contents(id) ON DELETE CASCADE,
  body_md  TEXT
);

-- INTERACTIONS
CREATE TABLE IF NOT EXISTS likes (
  id          BIGSERIAL     PRIMARY KEY,
  content_id  BIGINT        NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  user_id     BIGINT        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_like_user_content UNIQUE (user_id, content_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id          BIGSERIAL   PRIMARY KEY,
  content_id  BIGINT      NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  user_id     BIGINT      NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  parent_id   BIGINT      NULL,
  content     TEXT        NOT NULL,          -- or rename to body if that's your entity field
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure parent replies stay on the SAME content
-- 1) Provide a unique key in the SAME column order the FK will reference
ALTER TABLE comments
  ADD CONSTRAINT IF NOT EXISTS uq_comments_content_id_id
  UNIQUE (content_id, id);

-- 2) Composite FK: (content_id, parent_id) must match an existing (content_id, id)
ALTER TABLE comments
  ADD CONSTRAINT IF NOT EXISTS fk_comments_parent_same_content
  FOREIGN KEY (content_id, parent_id)
  REFERENCES comments (content_id, id)
  ON DELETE CASCADE;

-- PASSWORD RESET TOKENS
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          BIGSERIAL    PRIMARY KEY,
  user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       UUID         NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ  NOT NULL,
  used_at     TIMESTAMPTZ  NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_pwdreset_times CHECK (expires_at > created_at)
);

-- At most one outstanding (not yet used) reset token per user
CREATE UNIQUE INDEX IF NOT EXISTS ux_pwdreset_one_active_per_user
  ON password_reset_tokens (user_id)
  WHERE used_at IS NULL;

-- REFRESH TOKENS (server-side sessions)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id           BIGSERIAL    PRIMARY KEY,
  jti          UUID         NOT NULL UNIQUE,             -- server-side handle for refresh
  user_id      BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  issued_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ  NULL,
  expires_at   TIMESTAMPTZ  NOT NULL,                    -- e.g., now() + 7 days
  user_agent   TEXT         NULL,
  ip           INET         NULL,
  revoked      BOOLEAN      NOT NULL DEFAULT FALSE,
  CONSTRAINT chk_refresh_times CHECK (expires_at > issued_at)
);

-- Helpful session indexes
CREATE INDEX IF NOT EXISTS idx_refresh_user          ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_valid         ON refresh_tokens(revoked, expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_active_user   ON refresh_tokens(user_id) WHERE revoked = false;

-- (Optional) SINGLE active session per user:
-- CREATE UNIQUE INDEX IF NOT EXISTS ux_refresh_one_active_per_user
--   ON refresh_tokens (user_id)
--   WHERE revoked = false;

-- EMAIL VERIFICATION TOKENS
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id          BIGSERIAL     PRIMARY KEY,
  jti         UUID          NOT NULL UNIQUE,
  email       VARCHAR(254)  NOT NULL,
  issued_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ   NOT NULL,
  used        BOOLEAN       NOT NULL DEFAULT FALSE,
  used_at     TIMESTAMPTZ,
  CONSTRAINT chk_evt_time CHECK (expires_at > issued_at),
  CONSTRAINT chk_evt_used CHECK (
    (used = false AND used_at IS NULL) OR
    (used = true  AND used_at IS NOT NULL)
  )
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_contents_created_at     ON contents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_content_id     ON comments(content_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id      ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_content_created ON comments(content_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_user_id           ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_content_id        ON likes(content_id);
CREATE INDEX IF NOT EXISTS idx_likes_content_created   ON likes(content_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pwdreset_user_expires   ON password_reset_tokens(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_evt_email               ON email_verification_tokens(email);
CREATE INDEX IF NOT EXISTS idx_evt_active              ON email_verification_tokens(expires_at, used);

-- At most one active (unused) email verification token per email
CREATE UNIQUE INDEX IF NOT EXISTS ux_evt_one_active_email
  ON email_verification_tokens(email)
  WHERE used = false;

-- -------------------------
-- Optional moderation (soft delete) – only if you later add fields in your model:
-- ALTER TABLE comments
--   ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
--   ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
-- -------------------------
