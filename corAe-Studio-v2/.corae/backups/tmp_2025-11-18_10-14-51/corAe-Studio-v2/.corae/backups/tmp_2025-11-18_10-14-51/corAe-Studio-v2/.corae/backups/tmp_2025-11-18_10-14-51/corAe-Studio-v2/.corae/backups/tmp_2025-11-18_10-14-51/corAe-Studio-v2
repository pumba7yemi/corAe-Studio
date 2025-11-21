-- create role + db
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'coraeapp') THEN
    CREATE ROLE coraeapp WITH LOGIN PASSWORD 'corAe1';
  END IF;
END$$;

ALTER ROLE coraeapp SET search_path TO public;

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'corae') THEN
    CREATE DATABASE corae OWNER coraeapp TEMPLATE template1;
  END IF;
END$$;

-- connect to the new DB
\c corae

-- extensions (must run as postgres superuser)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- permissions
GRANT ALL PRIVILEGES ON DATABASE corae TO coraeapp;
GRANT ALL ON SCHEMA public TO coraeapp;

-- tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'workflow_partner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cims_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID,
  sender_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,
  direction TEXT NOT NULL,
  body TEXT,
  media_url TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cims_messages_thread ON cims_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_cims_messages_created ON cims_messages(created_at);

CREATE TABLE IF NOT EXISTS workfocus_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  bucket TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  due_at TIMESTAMPTZ,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_workfocus_owner ON workfocus_tasks(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_workfocus_bucket ON workfocus_tasks(bucket);

-- seed
INSERT INTO users (email, display_name, role)
VALUES ('owner@corae.app','Subject 1','owner')
ON CONFLICT (email) DO NOTHING;