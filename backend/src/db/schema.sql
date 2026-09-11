-- ============================================================
-- NLAS — National Land Acquisition System
-- PostgreSQL + PostGIS Schema
-- Run: psql -U postgres -d nlas_db -f schema.sql
-- ============================================================

-- Enable PostGIS extension (run once per database)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(200) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(50)  NOT NULL CHECK (role IN (
                  'CENTRAL_OFFICER','STATE_OFFICER','DISTRICT_OFFICER',
                  'FIELD_OFFICER','VIEWER'
                )),
  state         VARCHAR(100),
  district      VARCHAR(100),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

-- ─── PROJECTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             VARCHAR(500) NOT NULL,
  code             VARCHAR(50)  UNIQUE NOT NULL,
  type             VARCHAR(50)  NOT NULL CHECK (type IN (
                     'HIGHWAY','RAILWAY','INDUSTRIAL','POWER',
                     'PORT','IRRIGATION','URBAN','OTHER'
                   )),
  department       VARCHAR(300),
  state            VARCHAR(100) NOT NULL,
  district         VARCHAR(100) NOT NULL,
  status           VARCHAR(50)  NOT NULL DEFAULT 'DRAFT'
                   CHECK (status IN (
                     'DRAFT','SUBMITTED','UNDER_SCRUTINY','APPROVED',
                     'NOTIFICATION','AWARD','COMPENSATION',
                     'POSSESSION','RNR','CLOSED'
                   )),
  progress         SMALLINT NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  required_area    NUMERIC(12,2) NOT NULL DEFAULT 0,
  acquired_area    NUMERIC(12,2) NOT NULL DEFAULT 0,
  target_date      DATE,
  start_date       DATE,
  affected_families INTEGER NOT NULL DEFAULT 0,
  description      TEXT,
  current_milestone TEXT,
  next_action       TEXT,
  -- PostGIS: project corridor boundary polygon
  boundary_geom    GEOMETRY(POLYGON, 4326),
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_projects_status   ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_state    ON projects(state);
CREATE INDEX IF NOT EXISTS idx_projects_district ON projects(district);
CREATE INDEX IF NOT EXISTS idx_projects_boundary ON projects USING GIST(boundary_geom);

-- ─── WORKFLOW HISTORY ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflow_history (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status     VARCHAR(50) NOT NULL,
  actor_id   UUID REFERENCES users(id),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_workflow_project ON workflow_history(project_id);

-- ─── PARCELS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parcels (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id       UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  khasra_no        VARCHAR(100) NOT NULL,
  village          VARCHAR(200),
  district         VARCHAR(100),
  state            VARCHAR(100),
  land_type        VARCHAR(100) DEFAULT 'Agricultural',
  area             NUMERIC(10,4) NOT NULL DEFAULT 0,
  status           VARCHAR(50)  NOT NULL DEFAULT 'PENDING'
                   CHECK (status IN (
                     'PENDING','NOTIFIED','ACQUIRED',
                     'DISPUTED','POSSESSION_TAKEN'
                   )),
  owners_count     INTEGER DEFAULT 0,
  affected_families INTEGER DEFAULT 0,
  -- PostGIS: actual parcel polygon from land records
  geom             GEOMETRY(POLYGON, 4326),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_parcels_project   ON parcels(project_id);
CREATE INDEX IF NOT EXISTS idx_parcels_status    ON parcels(status);
CREATE INDEX IF NOT EXISTS idx_parcels_khasra    ON parcels(khasra_no);
CREATE INDEX IF NOT EXISTS idx_parcels_geom      ON parcels USING GIST(geom);

-- ─── PARCEL OWNERS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parcel_owners (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parcel_id UUID NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
  name      VARCHAR(300) NOT NULL,
  share     NUMERIC(5,4) NOT NULL DEFAULT 1.0  -- fraction of ownership (0.0 to 1.0)
);
CREATE INDEX IF NOT EXISTS idx_owners_parcel ON parcel_owners(parcel_id);

-- ─── COMPENSATION ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compensation (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parcel_id  UUID UNIQUE NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
  assessed   NUMERIC(15,2) NOT NULL DEFAULT 0,
  approved   NUMERIC(15,2) NOT NULL DEFAULT 0,
  disbursed  NUMERIC(15,2) NOT NULL DEFAULT 0,
  status     VARCHAR(50) NOT NULL DEFAULT 'PENDING_PAYMENT'
             CHECK (status IN ('PENDING_PAYMENT','PARTIAL','PAID')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PAYMENT RECORDS (individual disbursements) ────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_records (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parcel_id         UUID NOT NULL REFERENCES parcels(id),
  amount            NUMERIC(15,2) NOT NULL,
  payment_date      DATE NOT NULL,
  payment_reference VARCHAR(200) NOT NULL,
  recorded_by       UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_parcel ON payment_records(parcel_id);

-- ─── R&R (Rehabilitation & Resettlement) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS rnr (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parcel_id             UUID NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
  head_name             VARCHAR(300),
  village               VARCHAR(200),
  displacement          VARCHAR(20) CHECK (displacement IN ('FULL','PARTIAL')),
  affected_families     INTEGER DEFAULT 1,
  compensation_status   VARCHAR(30) DEFAULT 'PENDING'
                        CHECK (compensation_status IN ('PENDING','IN_PROGRESS','COMPLETED')),
  rehabilitation_status VARCHAR(30) DEFAULT 'PENDING'
                        CHECK (rehabilitation_status IN ('PENDING','IN_PROGRESS','COMPLETED','NOT_APPLICABLE')),
  resettlement_status   VARCHAR(30) DEFAULT 'PENDING'
                        CHECK (resettlement_status IN ('PENDING','IN_PROGRESS','COMPLETED','NOT_APPLICABLE')),
  benefits              JSONB DEFAULT '[]',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rnr_parcel ON rnr(parcel_id);

-- ─── DOCUMENTS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  filename    VARCHAR(500) NOT NULL,
  file_path   VARCHAR(500) NOT NULL,
  type        VARCHAR(50)  NOT NULL DEFAULT 'OTHER'
              CHECK (type IN (
                'SIA_REPORT','NOTIFICATION','AWARD_ORDER',
                'COMPENSATION_MATRIX','RNR_PLAN','OTHER'
              )),
  version     INTEGER NOT NULL DEFAULT 1,
  file_size   BIGINT,
  uploaded_by UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);

-- ─── OBJECTIONS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS objections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parcel_id   UUID REFERENCES parcels(id),
  raised_by   VARCHAR(300) NOT NULL,
  reason      TEXT NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'OPEN'
              CHECK (status IN ('OPEN','RESOLVED','WITHDRAWN')),
  resolution  TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_objections_project ON objections(project_id);
CREATE INDEX IF NOT EXISTS idx_objections_status  ON objections(status);

-- ─── AUDIT LOGS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50)  NOT NULL,  -- PROJECT, PARCEL, USER, RNR, etc.
  entity_id   VARCHAR(255) NOT NULL,
  action      VARCHAR(100) NOT NULL,  -- PROJECT_CREATED, STATUS_TRANSITION, etc.
  actor_id    UUID REFERENCES users(id),
  old_value   JSONB,
  new_value   JSONB,
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_entity    ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_action    ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created   ON audit_logs(created_at DESC);

-- ─── ALERTS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            VARCHAR(300) NOT NULL,
  message          TEXT NOT NULL,
  severity         VARCHAR(20) NOT NULL DEFAULT 'MEDIUM'
                   CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  project_id       UUID REFERENCES projects(id),
  target_user_id   UUID REFERENCES users(id),  -- NULL = broadcast
  target_state     VARCHAR(100),
  target_district  VARCHAR(100),
  is_read          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_alerts_user    ON alerts(target_user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_project ON alerts(project_id);
