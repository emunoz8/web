-- ==========================================
-- V2: categories + many-to-many content tags
-- ==========================================

-- Categories are grouped by domain so BLOG and PROJECT can have different
-- subcategory sets while still sharing one normalized table.
CREATE TABLE IF NOT EXISTS categories (
  id          BIGSERIAL    PRIMARY KEY,
  domain      VARCHAR(20)  NOT NULL CHECK (domain IN ('PROJECT', 'BLOG')),
  slug        VARCHAR(80)  NOT NULL,
  label       VARCHAR(120) NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_categories_domain_slug UNIQUE (domain, slug)
);

-- Many-to-many mapping so a content item can belong to multiple categories.
CREATE TABLE IF NOT EXISTS content_categories (
  content_id   BIGINT       NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  category_id  BIGINT       NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  PRIMARY KEY (content_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_categories_domain_label
  ON categories(domain, label);

CREATE INDEX IF NOT EXISTS idx_content_categories_category_content
  ON content_categories(category_id, content_id);
