CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_key TEXT UNIQUE,
  display_name TEXT,
  email TEXT UNIQUE,
  locale TEXT NOT NULL DEFAULT 'en' CHECK (locale IN ('zh', 'en')),
  country_code CHAR(2),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scripts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  genre TEXT,
  player_count INTEGER NOT NULL DEFAULT 1 CHECK (player_count > 0),
  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  difficulty TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  author TEXT,
  cover TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  i18n JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_filename TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS script_versions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  script_id TEXT NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  payload JSONB NOT NULL,
  source TEXT NOT NULL DEFAULT 'import',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (script_id, version)
);

CREATE TABLE IF NOT EXISTS script_characters (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  script_id TEXT NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  character_key TEXT NOT NULL,
  name_zh TEXT,
  name_en TEXT,
  role_zh TEXT,
  role_en TEXT,
  avatar_url TEXT,
  dialogue JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (script_id, character_key)
);

CREATE TABLE IF NOT EXISTS script_evidence (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  script_id TEXT NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  evidence_key TEXT NOT NULL,
  name_zh TEXT,
  name_en TEXT,
  type_zh TEXT,
  type_en TEXT,
  detail_zh TEXT,
  detail_en TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (script_id, evidence_key)
);

CREATE TABLE IF NOT EXISTS script_timeline (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  script_id TEXT NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  event_time TEXT NOT NULL,
  text_zh TEXT,
  text_en TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (script_id, sort_order)
);

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id TEXT NOT NULL REFERENCES scripts(id) ON DELETE RESTRICT,
  host_user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'live', 'closed')),
  max_players INTEGER NOT NULL DEFAULT 6 CHECK (max_players > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS room_members (
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  member_role TEXT NOT NULL DEFAULT 'player' CHECK (member_role IN ('host', 'player', 'spectator')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  PRIMARY KEY (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id TEXT NOT NULL REFERENCES scripts(id) ON DELETE RESTRICT,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
  mode TEXT NOT NULL DEFAULT 'solo' CHECK (mode IN ('solo', 'room', 'spectator')),
  locale TEXT NOT NULL DEFAULT 'en' CHECK (locale IN ('zh', 'en')),
  phase TEXT NOT NULL DEFAULT 'briefing' CHECK (phase IN ('briefing', 'evidence', 'question', 'vote', 'result')),
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS game_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  sequence_no INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, sequence_no)
);

CREATE TABLE IF NOT EXISTS content_imports (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  filename TEXT NOT NULL,
  script_id TEXT REFERENCES scripts(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  payload JSONB,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS scripts_published_updated_idx ON scripts (published, updated_at DESC);
CREATE INDEX IF NOT EXISTS rooms_status_created_idx ON rooms (status, created_at DESC);
CREATE INDEX IF NOT EXISTS room_members_user_idx ON room_members (user_id, joined_at DESC);
CREATE INDEX IF NOT EXISTS sessions_user_started_idx ON game_sessions (user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS sessions_script_started_idx ON game_sessions (script_id, started_at DESC);
CREATE INDEX IF NOT EXISTS game_events_session_created_idx ON game_events (session_id, created_at);
CREATE INDEX IF NOT EXISTS content_imports_imported_idx ON content_imports (imported_at DESC);
