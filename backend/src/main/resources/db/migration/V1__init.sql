-- =========================
-- V1: initial schema (PostgreSQL)
-- =========================

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id             BIGSERIAL PRIMARY KEY,
  email          VARCHAR(255) NOT NULL UNIQUE,
  username       VARCHAR(100) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  role           VARCHAR(50)  NOT NULL,              -- e.g. USER/ADMIN
  email_verified BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- CONTENTS (parent)
-- NOTE: both "type" and "content_type" are present because your query selects both
--   type:          'PROJECT' | 'BLOG'
--   content_type:  render/storage format, e.g. 'MARKDOWN', 'HTML', etc.
CREATE TABLE IF NOT EXISTS contents (
  id            BIGSERIAL PRIMARY KEY,
  type          VARCHAR(20)  NOT NULL CHECK (type IN ('PROJECT','BLOG')),
  content_type  VARCHAR(32)  NOT NULL,
  title         VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) NOT NULL UNIQUE,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- PROJECTS (1:1 with contents)
CREATE TABLE IF NOT EXISTS projects (
  id           BIGINT PRIMARY KEY REFERENCES contents(id) ON DELETE CASCADE,
  description  TEXT
  -- add project-only fields here
);

-- BLOG POSTS (1:1 with contents)
CREATE TABLE IF NOT EXISTS blog_posts (
  id       BIGINT PRIMARY KEY REFERENCES contents(id) ON DELETE CASCADE,
  body_md  TEXT
  -- add blog-only fields here
);

-- INTERACTIONS
CREATE TABLE IF NOT EXISTS likes (
  id          BIGSERIAL PRIMARY KEY,
  content_id  BIGINT  NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  user_id     BIGINT  NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_like_user_content UNIQUE (user_id, content_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id          BIGSERIAL PRIMARY KEY,
  content_id  BIGINT  NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  user_id     BIGINT  NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  parent_id   BIGINT  REFERENCES comments(id) ON DELETE CASCADE,
  content     TEXT    NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- PASSWORD RESET TOKENS
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       UUID   NOT NULL UNIQUE,
  expires_at  TIMESTAMP NOT NULL,
  used_at     TIMESTAMP NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_contents_created_at ON contents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_content_id ON comments(content_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id  ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id       ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_content_id    ON likes(content_id);
CREATE INDEX IF NOT EXISTS idx_pwdreset_user_expires ON password_reset_tokens(user_id, expires_at);
