-- =============================================================================
-- Migration 001: Initial Schema — T&J CRM (Multi-Tenant LinkedIn Outreach)
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ORGANIZATIONS (Tenants)
-- =============================================================================

CREATE TABLE organizations (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  slug          TEXT        NOT NULL UNIQUE,
  -- settings.admin_visibility: "all" | "own" (default: "all")
  settings      JSONB       NOT NULL DEFAULT '{"admin_visibility": "all"}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PROFILES (extends auth.users)
-- =============================================================================

CREATE TABLE profiles (
  id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role            TEXT        NOT NULL CHECK (role IN ('super_admin', 'org_admin', 'member')),
  full_name       TEXT,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_org ON profiles(organization_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- =============================================================================
-- PITCH TEMPLATES
-- =============================================================================

CREATE TABLE pitch_templates (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by      UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  name            TEXT        NOT NULL,
  subject         TEXT,
  body            TEXT        NOT NULL,
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pitch_templates_org ON pitch_templates(organization_id);

-- =============================================================================
-- PROSPECTS (LinkedIn contacts)
-- =============================================================================

CREATE TABLE prospects (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by      UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  linkedin_url    TEXT,
  first_name      TEXT        NOT NULL,
  last_name       TEXT        NOT NULL,
  company         TEXT,
  position        TEXT,
  email           TEXT,
  phone           TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prospects_org ON prospects(organization_id);
CREATE INDEX idx_prospects_created_by ON prospects(created_by);

-- =============================================================================
-- PITCHES (outreach events)
-- =============================================================================

CREATE TABLE pitches (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  prospect_id     UUID        NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  template_id     UUID        REFERENCES pitch_templates(id) ON DELETE SET NULL,
  sent_by         UUID        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status          TEXT        NOT NULL DEFAULT 'sent'
                              CHECK (status IN ('sent', 'delivered', 'answered', 'ignored', 'bounced')),
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answered_at     TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pitches_org_status ON pitches(organization_id, status, sent_at DESC);
CREATE INDEX idx_pitches_prospect   ON pitches(prospect_id);
CREATE INDEX idx_pitches_sent_by    ON pitches(sent_by);

-- =============================================================================
-- FOLLOWUPS (3 levels per pitch)
-- =============================================================================

CREATE TABLE followups (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id        UUID        NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_to     UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  level           SMALLINT    NOT NULL CHECK (level BETWEEN 1 AND 3),
  status          TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'sent', 'skipped')),
  scheduled_for   DATE,
  sent_at         TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pitch_id, level)
);

CREATE INDEX idx_followups_assigned_due ON followups(assigned_to, scheduled_for, status)
  WHERE status = 'pending';
CREATE INDEX idx_followups_org ON followups(organization_id);

-- =============================================================================
-- LEADS (auto-created when pitch.status → 'answered')
-- =============================================================================

CREATE TABLE leads (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  prospect_id     UUID        NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  pitch_id        UUID        REFERENCES pitches(id) ON DELETE SET NULL,
  assigned_to     UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  status          TEXT        NOT NULL DEFAULT 'new'
                              CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiating', 'won', 'lost')),
  deal_value      DECIMAL(12, 2),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_org_status ON leads(organization_id, assigned_to, status);
CREATE INDEX idx_leads_prospect   ON leads(prospect_id);
CREATE INDEX idx_leads_pitch      ON leads(pitch_id);

-- =============================================================================
-- APPOINTMENTS
-- =============================================================================

CREATE TABLE appointments (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id               UUID        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  created_by            UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to           UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  title                 TEXT        NOT NULL,
  scheduled_at          TIMESTAMPTZ NOT NULL,
  duration_minutes      INT         NOT NULL DEFAULT 30,
  location              TEXT,
  status                TEXT        NOT NULL DEFAULT 'scheduled'
                                    CHECK (status IN ('scheduled', 'completed', 'rescheduled', 'cancelled', 'no_show')),
  previous_scheduled_at TIMESTAMPTZ,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_assigned_due ON appointments(assigned_to, scheduled_at, status)
  WHERE status = 'scheduled';
CREATE INDEX idx_appointments_lead ON appointments(lead_id);
CREATE INDEX idx_appointments_org  ON appointments(organization_id);

-- =============================================================================
-- MEETING OUTCOMES
-- =============================================================================

CREATE TABLE meeting_outcomes (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID        NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  recorded_by     UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  outcome         TEXT        NOT NULL
                              CHECK (outcome IN (
                                'interested', 'not_interested', 'follow_up_needed',
                                'proposal_requested', 'closed_won', 'closed_lost'
                              )),
  summary         TEXT,
  next_steps      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meeting_outcomes_appointment ON meeting_outcomes(appointment_id);
CREATE INDEX idx_meeting_outcomes_org         ON meeting_outcomes(organization_id);

-- =============================================================================
-- DEALS
-- =============================================================================

CREATE TABLE deals (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id             UUID        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  created_by          UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to         UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  name                TEXT        NOT NULL,
  value               DECIMAL(12, 2),
  currency            TEXT        NOT NULL DEFAULT 'EUR',
  stage               TEXT        NOT NULL DEFAULT 'discovery'
                                  CHECK (stage IN ('discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  probability         INT         NOT NULL DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
  expected_close_date DATE,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deals_org_stage ON deals(organization_id, stage);
CREATE INDEX idx_deals_lead      ON deals(lead_id);
CREATE INDEX idx_deals_assigned  ON deals(assigned_to);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

CREATE TABLE notifications (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            TEXT        NOT NULL
                              CHECK (type IN (
                                'followup_due', 'appointment_due',
                                'appointment_rescheduled', 'lead_created', 'deal_updated'
                              )),
  reference_table TEXT,
  reference_id    UUID,
  title           TEXT        NOT NULL,
  body            TEXT,
  is_read         BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC)
  WHERE is_read = FALSE;

-- =============================================================================
-- Enable Row Level Security on all tables
-- =============================================================================

ALTER TABLE organizations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_templates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitches          ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups        ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads            ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications    ENABLE ROW LEVEL SECURITY;
