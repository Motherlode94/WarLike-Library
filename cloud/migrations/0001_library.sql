-- WarLike Library dedicated D1 schema. NOT deployed.
-- User identity must be established by a verified server-side authentication provider.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS library_users (
  id TEXT PRIMARY KEY NOT NULL,
  external_subject TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  disabled_at TEXT
);
CREATE TABLE IF NOT EXISTS library_projects (
  id TEXT PRIMARY KEY NOT NULL,
  owner_id TEXT NOT NULL REFERENCES library_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 160),
  manifest_json TEXT NOT NULL DEFAULT '{}',
  revision INTEGER NOT NULL DEFAULT 1 CHECK(revision > 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_library_projects_owner ON library_projects(owner_id,updated_at);
CREATE TABLE IF NOT EXISTS library_assets (
  id TEXT PRIMARY KEY NOT NULL,
  owner_id TEXT NOT NULL REFERENCES library_users(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES library_projects(id) ON DELETE SET NULL,
  filename TEXT NOT NULL CHECK(length(filename) BETWEEN 1 AND 160),
  kind TEXT NOT NULL CHECK(kind IN ('model','image','audio','video','script','document')),
  sha256 TEXT NOT NULL CHECK(length(sha256)=64),
  bytes INTEGER NOT NULL CHECK(bytes BETWEEN 0 AND 33554432),
  r2_key TEXT NOT NULL UNIQUE,
  license TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  revision INTEGER NOT NULL DEFAULT 1 CHECK(revision > 0),
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_library_assets_owner ON library_assets(owner_id,project_id,deleted_at);
CREATE TABLE IF NOT EXISTS library_prefabs (
  id TEXT PRIMARY KEY NOT NULL,
  owner_id TEXT NOT NULL REFERENCES library_users(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES library_assets(id) ON DELETE RESTRICT,
  parent_id TEXT REFERENCES library_prefabs(id) ON DELETE RESTRICT,
  name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 160),
  mode TEXT NOT NULL CHECK(mode IN ('2d','3d')),
  components_json TEXT NOT NULL DEFAULT '{}',
  revision INTEGER NOT NULL DEFAULT 1 CHECK(revision > 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK(parent_id IS NULL OR parent_id <> id)
);
CREATE INDEX IF NOT EXISTS idx_library_prefabs_owner ON library_prefabs(owner_id,asset_id);
CREATE TABLE IF NOT EXISTS library_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id TEXT NOT NULL REFERENCES library_users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_library_audit_owner ON library_audit_log(owner_id,created_at);
-- Application layer must validate parent ancestry and ownership, and use WHERE owner_id = verified session identity.
-- Never accept user_id, storage key or project_id authority from an unauthenticated request.
