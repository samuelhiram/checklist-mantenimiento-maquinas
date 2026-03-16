-- ============================================================
-- MaquinaCheck - Schema Completo
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- -------------------------
-- EXTENSIONES
-- -------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------
-- ENUM TYPES
-- -------------------------
CREATE TYPE user_role AS ENUM ('operator', 'supervisor', 'admin');
CREATE TYPE machine_status AS ENUM ('active', 'inactive', 'maintenance', 'decommissioned');
CREATE TYPE checklist_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE execution_status AS ENUM ('pending', 'in_progress', 'completed', 'failed', 'cancelled');
CREATE TYPE item_type AS ENUM ('check', 'measure', 'photo', 'text', 'number', 'select');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE frequency_type AS ENUM ('manual', 'daily', 'weekly', 'monthly', 'custom');

-- -------------------------
-- TABLA: organizations (multi-tenant)
-- -------------------------
CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  logo_url    TEXT,
  plan        TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  settings    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------
-- TABLA: profiles (extiende auth.users)
-- -------------------------
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  full_name       TEXT,
  avatar_url      TEXT,
  role            user_role DEFAULT 'operator',
  department      TEXT,
  badge_number    TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  last_seen_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------
-- TABLA: locations (plantas, edificios, zonas)
-- -------------------------
CREATE TABLE locations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  code        TEXT,
  parent_id   UUID REFERENCES locations(id),
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------
-- TABLA: machines (máquinas, procesos, servicios)
-- -------------------------
CREATE TABLE machines (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id     UUID REFERENCES locations(id),
  name            TEXT NOT NULL,
  code            TEXT,
  type            TEXT, -- 'machine', 'process', 'service', 'equipment'
  manufacturer    TEXT,
  model           TEXT,
  serial_number   TEXT,
  status          machine_status DEFAULT 'active',
  priority        priority_level DEFAULT 'medium',
  image_url       TEXT,
  description     TEXT,
  specs           JSONB DEFAULT '{}', -- specs técnicas libres
  tags            TEXT[] DEFAULT '{}',
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------
-- TABLA: checklists (plantillas)
-- -------------------------
CREATE TABLE checklists (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  machine_id      UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  version         INTEGER DEFAULT 1,
  status          checklist_status DEFAULT 'draft',
  priority        priority_level DEFAULT 'medium',
  frequency       frequency_type DEFAULT 'manual',
  frequency_cron  TEXT, -- cron expression si frequency=custom
  estimated_min   INTEGER DEFAULT 15, -- tiempo estimado en minutos
  required_role   user_role DEFAULT 'operator',
  instructions    TEXT, -- instrucciones generales
  tags            TEXT[] DEFAULT '{}',
  is_template     BOOLEAN DEFAULT FALSE, -- si puede usarse como plantilla global
  created_by      UUID REFERENCES profiles(id),
  updated_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------
-- TABLA: checklist_items (ítems de una plantilla)
-- -------------------------
CREATE TABLE checklist_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id    UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  parent_id       UUID REFERENCES checklist_items(id), -- para sub-ítems / secciones
  position        INTEGER NOT NULL DEFAULT 0,
  item_type       item_type DEFAULT 'check',
  title           TEXT NOT NULL,
  description     TEXT,
  is_required     BOOLEAN DEFAULT TRUE,
  is_critical     BOOLEAN DEFAULT FALSE, -- si falla, bloquea completar
  -- Para tipo 'measure'
  unit            TEXT, -- 'PSI', 'RPM', '°C', etc.
  min_value       DECIMAL,
  max_value       DECIMAL,
  target_value    DECIMAL,
  -- Para tipo 'select'
  options         TEXT[] DEFAULT '{}',
  -- Para tipo 'photo'
  photo_required  BOOLEAN DEFAULT FALSE,
  -- Metadatos
  help_text       TEXT,
  reference_image TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------
-- TABLA: executions (ejecuciones de checklists)
-- -------------------------
CREATE TABLE executions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  checklist_id      UUID NOT NULL REFERENCES checklists(id),
  machine_id        UUID NOT NULL REFERENCES machines(id),
  assigned_to       UUID REFERENCES profiles(id),
  executed_by       UUID REFERENCES profiles(id),
  reviewed_by       UUID REFERENCES profiles(id),
  status            execution_status DEFAULT 'pending',
  priority          priority_level DEFAULT 'medium',
  scheduled_at      TIMESTAMPTZ,
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  due_at            TIMESTAMPTZ,
  score             DECIMAL, -- % de ítems OK
  notes             TEXT,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------
-- TABLA: execution_results (respuestas por ítem)
-- -------------------------
CREATE TABLE execution_results (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id    UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
  item_id         UUID NOT NULL REFERENCES checklist_items(id),
  -- Resultado según tipo
  is_checked      BOOLEAN, -- para 'check'
  value_text      TEXT,    -- para 'text'
  value_number    DECIMAL, -- para 'number', 'measure'
  value_select    TEXT,    -- para 'select'
  photo_url       TEXT,    -- para 'photo'
  -- Estado
  is_ok           BOOLEAN,
  is_na           BOOLEAN DEFAULT FALSE, -- no aplica
  comment         TEXT,
  flagged         BOOLEAN DEFAULT FALSE,
  recorded_at     TIMESTAMPTZ DEFAULT NOW(),
  recorded_by     UUID REFERENCES profiles(id)
);

-- -------------------------
-- TABLA: findings (hallazgos / anomalías)
-- -------------------------
CREATE TABLE findings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  execution_id    UUID REFERENCES executions(id),
  machine_id      UUID NOT NULL REFERENCES machines(id),
  item_id         UUID REFERENCES checklist_items(id),
  reported_by     UUID REFERENCES profiles(id),
  assigned_to     UUID REFERENCES profiles(id),
  title           TEXT NOT NULL,
  description     TEXT,
  severity        priority_level DEFAULT 'medium',
  status          TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  photos          TEXT[] DEFAULT '{}',
  resolved_at     TIMESTAMPTZ,
  resolution_note TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------
-- TABLA: audit_log
-- -------------------------
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID REFERENCES organizations(id),
  user_id     UUID REFERENCES profiles(id),
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------
-- ÍNDICES
-- -------------------------
CREATE INDEX idx_profiles_org       ON profiles(org_id);
CREATE INDEX idx_machines_org       ON machines(org_id);
CREATE INDEX idx_machines_status    ON machines(status);
CREATE INDEX idx_checklists_machine ON checklists(machine_id);
CREATE INDEX idx_checklists_status  ON checklists(status);
CREATE INDEX idx_items_checklist    ON checklist_items(checklist_id, position);
CREATE INDEX idx_executions_org     ON executions(org_id);
CREATE INDEX idx_executions_machine ON executions(machine_id);
CREATE INDEX idx_executions_status  ON executions(status);
CREATE INDEX idx_executions_assigned ON executions(assigned_to);
CREATE INDEX idx_results_execution  ON execution_results(execution_id);
CREATE INDEX idx_findings_machine   ON findings(machine_id);
CREATE INDEX idx_findings_status    ON findings(status);
CREATE INDEX idx_audit_org          ON audit_log(org_id, created_at DESC);

-- -------------------------
-- UPDATED_AT TRIGGERS
-- -------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated      BEFORE UPDATE ON profiles      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_machines_updated      BEFORE UPDATE ON machines      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_checklists_updated    BEFORE UPDATE ON checklists    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_executions_updated    BEFORE UPDATE ON executions    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_findings_updated      BEFORE UPDATE ON findings      FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -------------------------
-- AUTO-CREATE PROFILE ON SIGNUP
-- -------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- -------------------------
-- ROW LEVEL SECURITY
-- -------------------------
ALTER TABLE organizations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines           ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists         ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE executions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_results  ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log          ENABLE ROW LEVEL SECURITY;

-- Helper para obtener org_id del usuario actual
CREATE OR REPLACE FUNCTION auth_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Profiles: ver todos de su org
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (org_id = auth_user_org_id() OR id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "profiles_admin_all" ON profiles FOR ALL
  USING (auth_user_role() IN ('admin', 'supervisor'));

-- Organizations: solo ver la propia
CREATE POLICY "orgs_select_own" ON organizations FOR SELECT
  USING (id = auth_user_org_id());

CREATE POLICY "orgs_update_admin" ON organizations FOR UPDATE
  USING (id = auth_user_org_id() AND auth_user_role() = 'admin');

-- Machines: todos en la org pueden ver, solo admin/supervisor editar
CREATE POLICY "machines_select" ON machines FOR SELECT
  USING (org_id = auth_user_org_id());

CREATE POLICY "machines_write_admin" ON machines FOR INSERT
  WITH CHECK (org_id = auth_user_org_id() AND auth_user_role() IN ('admin', 'supervisor'));

CREATE POLICY "machines_update_admin" ON machines FOR UPDATE
  USING (org_id = auth_user_org_id() AND auth_user_role() IN ('admin', 'supervisor'));

CREATE POLICY "machines_delete_admin" ON machines FOR DELETE
  USING (org_id = auth_user_org_id() AND auth_user_role() = 'admin');

-- Checklists: ver todos, escribir admin/supervisor
CREATE POLICY "checklists_select" ON checklists FOR SELECT
  USING (org_id = auth_user_org_id());

CREATE POLICY "checklists_write" ON checklists FOR INSERT
  WITH CHECK (org_id = auth_user_org_id() AND auth_user_role() IN ('admin', 'supervisor'));

CREATE POLICY "checklists_update" ON checklists FOR UPDATE
  USING (org_id = auth_user_org_id() AND auth_user_role() IN ('admin', 'supervisor'));

CREATE POLICY "checklists_delete" ON checklists FOR DELETE
  USING (org_id = auth_user_org_id() AND auth_user_role() = 'admin');

-- Checklist items: ligados a checklists de la org
CREATE POLICY "items_select" ON checklist_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM checklists c WHERE c.id = checklist_id AND c.org_id = auth_user_org_id()
  ));

CREATE POLICY "items_write" ON checklist_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM checklists c WHERE c.id = checklist_id AND c.org_id = auth_user_org_id()
    AND auth_user_role() IN ('admin', 'supervisor')
  ));

-- Executions: ver propias + asignadas, crear operadores
CREATE POLICY "executions_select" ON executions FOR SELECT
  USING (org_id = auth_user_org_id());

CREATE POLICY "executions_insert" ON executions FOR INSERT
  WITH CHECK (org_id = auth_user_org_id());

CREATE POLICY "executions_update" ON executions FOR UPDATE
  USING (org_id = auth_user_org_id() AND (
    executed_by = auth.uid() OR
    assigned_to = auth.uid() OR
    auth_user_role() IN ('admin', 'supervisor')
  ));

-- Results: ligados a executions de la org
CREATE POLICY "results_all" ON execution_results FOR ALL
  USING (EXISTS (
    SELECT 1 FROM executions e WHERE e.id = execution_id AND e.org_id = auth_user_org_id()
  ));

-- Findings: todos pueden ver, reportar
CREATE POLICY "findings_select" ON findings FOR SELECT
  USING (org_id = auth_user_org_id());

CREATE POLICY "findings_insert" ON findings FOR INSERT
  WITH CHECK (org_id = auth_user_org_id());

CREATE POLICY "findings_update" ON findings FOR UPDATE
  USING (org_id = auth_user_org_id() AND (
    reported_by = auth.uid() OR
    assigned_to = auth.uid() OR
    auth_user_role() IN ('admin', 'supervisor')
  ));

-- Audit: solo admins
CREATE POLICY "audit_admin" ON audit_log FOR SELECT
  USING (org_id = auth_user_org_id() AND auth_user_role() = 'admin');

-- -------------------------
-- VISTAS ÚTILES
-- -------------------------
CREATE OR REPLACE VIEW v_execution_summary AS
SELECT
  e.id,
  e.org_id,
  e.status,
  e.priority,
  e.scheduled_at,
  e.started_at,
  e.completed_at,
  e.due_at,
  e.score,
  m.name AS machine_name,
  m.code AS machine_code,
  m.type AS machine_type,
  c.name AS checklist_name,
  c.estimated_min,
  p.full_name AS assigned_to_name,
  p2.full_name AS executed_by_name,
  COUNT(ci.id) AS total_items,
  COUNT(CASE WHEN er.is_ok = TRUE THEN 1 END) AS items_ok,
  COUNT(CASE WHEN er.is_ok = FALSE THEN 1 END) AS items_fail,
  COUNT(CASE WHEN er.flagged = TRUE THEN 1 END) AS items_flagged
FROM executions e
JOIN machines m ON m.id = e.machine_id
JOIN checklists c ON c.id = e.checklist_id
LEFT JOIN profiles p  ON p.id  = e.assigned_to
LEFT JOIN profiles p2 ON p2.id = e.executed_by
LEFT JOIN checklist_items ci ON ci.checklist_id = c.id
LEFT JOIN execution_results er ON er.execution_id = e.id AND er.item_id = ci.id
GROUP BY e.id, m.name, m.code, m.type, c.name, c.estimated_min, p.full_name, p2.full_name;
