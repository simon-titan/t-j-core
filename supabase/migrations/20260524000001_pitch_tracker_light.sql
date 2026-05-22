-- =============================================================================
-- Migration: Pitch Tracker Light Version
-- =============================================================================
-- Adds a per-user default-view preference and a table for the manual
-- "Light" daily-stats variant. The "auto" variant is computed client-side
-- from existing data and needs no storage.
-- =============================================================================

-- ── Profile preference: which Pitch Tracker view to open by default ──────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pitch_tracker_default text NOT NULL DEFAULT 'detailed'
    CHECK (pitch_tracker_default IN ('detailed', 'light_auto', 'light_manual'));

-- ── Manual daily stats (one row per user per day) ────────────────────────────
CREATE TABLE IF NOT EXISTS pitch_tracker_daily_stats (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id           UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_date        DATE        NOT NULL,
  messages_sent     INTEGER     NOT NULL DEFAULT 0,
  followups_sent    INTEGER     NOT NULL DEFAULT 0,
  replies_received  INTEGER     NOT NULL DEFAULT 0,
  appointments_set  INTEGER     NOT NULL DEFAULT 0,
  closings          INTEGER     NOT NULL DEFAULT 0,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, entry_date)
);

CREATE INDEX IF NOT EXISTS idx_pitch_tracker_daily_stats_user_date
  ON pitch_tracker_daily_stats(user_id, entry_date);

ALTER TABLE pitch_tracker_daily_stats ENABLE ROW LEVEL SECURITY;

-- super_admin: all; org_admin (unless restricted): own org; everyone: own rows
CREATE POLICY "ptds_select" ON pitch_tracker_daily_stats FOR SELECT
  USING (
    public.get_my_role() = 'super_admin'
    OR (
      public.get_my_role() = 'org_admin'
      AND organization_id = public.get_my_org_id()
      AND NOT public.org_admin_restricted()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "ptds_insert" ON pitch_tracker_daily_stats FOR INSERT
  WITH CHECK (
    public.get_my_role() = 'super_admin'
    OR (organization_id = public.get_my_org_id() AND user_id = auth.uid())
  );

CREATE POLICY "ptds_update" ON pitch_tracker_daily_stats FOR UPDATE
  USING (
    public.get_my_role() = 'super_admin'
    OR user_id = auth.uid()
  );

CREATE POLICY "ptds_delete" ON pitch_tracker_daily_stats FOR DELETE
  USING (
    public.get_my_role() = 'super_admin'
    OR user_id = auth.uid()
  );
