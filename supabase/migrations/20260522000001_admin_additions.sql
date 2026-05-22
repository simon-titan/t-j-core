-- ============================================================
-- Admin Panel Additions — 2026-05-22
-- ============================================================

-- ─── Extend organizations ────────────────────────────────────
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS logo_url  TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- ─── Extend pitch_templates ──────────────────────────────────
ALTER TABLE pitch_templates
  ADD COLUMN IF NOT EXISTS target_audience TEXT,
  ADD COLUMN IF NOT EXISTS product_service TEXT;

-- ─── visibility_matrix ───────────────────────────────────────
-- A row (viewer_id, target_id) means viewer CAN see target.
-- No row = viewer cannot see target.
-- Default: all org members see each other (seed on user invite).
CREATE TABLE IF NOT EXISTS visibility_matrix (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  viewer_id  UUID        NOT NULL REFERENCES auth.users(id)    ON DELETE CASCADE,
  target_id  UUID        NOT NULL REFERENCES auth.users(id)    ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, viewer_id, target_id)
);

ALTER TABLE visibility_matrix ENABLE ROW LEVEL SECURITY;

-- super_admin: full access to all orgs
CREATE POLICY "vm_super_admin_all" ON visibility_matrix
  FOR ALL
  USING  (public.get_my_role() = 'super_admin')
  WITH CHECK (public.get_my_role() = 'super_admin');

-- org_admin: manage within own org
CREATE POLICY "vm_org_admin_own" ON visibility_matrix
  FOR ALL
  USING  (public.get_my_role() = 'org_admin' AND org_id = public.get_my_org_id())
  WITH CHECK (public.get_my_role() = 'org_admin' AND org_id = public.get_my_org_id());

-- member: read rows where they are viewer or target
CREATE POLICY "vm_member_read" ON visibility_matrix
  FOR SELECT
  USING (viewer_id = auth.uid() OR target_id = auth.uid());
