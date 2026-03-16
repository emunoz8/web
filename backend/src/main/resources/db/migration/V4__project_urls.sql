-- ==========================================
-- V4: optional launch URLs for project items
-- ==========================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS project_url TEXT;
