-- =============================================================================
-- Migration 002: Row Level Security Policies — T&J CRM
-- =============================================================================
-- Depends on: 20260521000001_initial_schema.sql
--
-- Role matrix:
--   super_admin → full access across all orgs
--   org_admin   → full access within own org (unless settings.admin_visibility = 'own')
--   member      → own records only
-- =============================================================================

-- =============================================================================
-- HELPER FUNCTIONS
-- Called inside every policy — cached per statement (STABLE + SECURITY DEFINER)
-- to avoid N+1 profile lookups per row.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Returns TRUE when the caller's org has admin_visibility set to restrict org_admin
-- to only their own records (i.e. behave like a member).
CREATE OR REPLACE FUNCTION public.org_admin_restricted()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (settings->>'admin_visibility') = 'own',
    FALSE
  )
  FROM public.organizations
  WHERE id = public.get_my_org_id()
$$;

-- =============================================================================
-- ORGANIZATIONS
-- =============================================================================

-- SELECT: super_admin sees all; everyone else sees only their own org
CREATE POLICY "orgs_select" ON organizations FOR SELECT
  USING (
    public.get_my_role() = 'super_admin'
    OR id = public.get_my_org_id()
  );

-- INSERT/UPDATE/DELETE: super_admin only
CREATE POLICY "orgs_insert" ON organizations FOR INSERT
  WITH CHECK (public.get_my_role() = 'super_admin');

CREATE POLICY "orgs_update" ON organizations FOR UPDATE
  USING (public.get_my_role() = 'super_admin');

CREATE POLICY "orgs_delete" ON organizations FOR DELETE
  USING (public.get_my_role() = 'super_admin');

-- =============================================================================
-- PROFILES
-- =============================================================================

CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (
    public.get_my_role() = 'super_admin'
    OR (public.get_my_role() = 'org_admin' AND organization_id = public.get_my_org_id())
    OR id = auth.uid()
  );

-- Users can update their own profile; org_admin can update members in their org; super_admin all
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  USING (
    public.get_my_role() = 'super_admin'
    OR (public.get_my_role() = 'org_admin' AND organization_id = public.get_my_org_id())
    OR id = auth.uid()
  );

-- Only super_admin can insert (profiles are created via auth trigger in prod)
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  WITH CHECK (public.get_my_role() = 'super_admin');

CREATE POLICY "profiles_delete" ON profiles FOR DELETE
  USING (
    public.get_my_role() = 'super_admin'
    OR (public.get_my_role() = 'org_admin' AND organization_id = public.get_my_org_id())
  );

-- =============================================================================
-- PITCH TEMPLATES
-- =============================================================================

CREATE POLICY "pitch_templates_select" ON pitch_templates FOR SELECT
  USING (
    public.get_my_role() = 'super_admin'
    OR organization_id = public.get_my_org_id()
  );

CREATE POLICY "pitch_templates_insert" ON pitch_templates FOR INSERT
  WITH CHECK (
    public.get_my_role() = 'super_admin'
    OR organization_id = public.get_my_org_id()
  );

-- org_admin: all in org; member: only own; super_admin: all
CREATE POLICY "pitch_templates_update" ON pitch_templates FOR UPDATE
  USING (
    public.get_my_role() = 'super_admin'
    OR (public.get_my_role() = 'org_admin' AND organization_id = public.get_my_org_id())
    OR created_by = auth.uid()
  );

CREATE POLICY "pitch_templates_delete" ON pitch_templates FOR DELETE
  USING (
    public.get_my_role() = 'super_admin'
    OR (public.get_my_role() = 'org_admin' AND organization_id = public.get_my_org_id())
    OR created_by = auth.uid()
  );

-- =============================================================================
-- PROSPECTS
-- =============================================================================

CREATE POLICY "prospects_select" ON prospects FOR SELECT
  USING (
    public.get_my_role() = 'super_admin'
    OR organization_id = public.get_my_org_id()
  );

CREATE POLICY "prospects_insert" ON prospects FOR INSERT
  WITH CHECK (
    public.get_my_role() = 'super_admin'
    OR organization_id = public.get_my_org_id()
  );

CREATE POLICY "prospects_update" ON prospects FOR UPDATE
  USING (
    public.get_my_role() = 'super_admin'
    OR (public.get_my_role() = 'org_admin' AND organization_id = public.get_my_org_id())
    OR created_by = auth.uid()
  );

CREATE POLICY "prospects_delete" ON prospects FOR DELETE
  USING (
    public.get_my_role() = 'super_admin'
    OR (public.get_my_role() = 'org_admin' AND organization_id = public.get_my_org_id())
    OR created_by = auth.uid()
  );

-- =============================================================================
-- PITCHES
-- org_admin restricted by settings.admin_visibility
-- =============================================================================

CREATE POLICY "pitches_select" ON pitches FOR SELECT
  USING (
    public.get_my_role() = 'super_admin'
    OR (
      public.get_my_role() = 'org_admin'
      AND organization_id = public.get_my_org_id()
      AND NOT public.org_admin_restricted()
    )
    OR sent_by = auth.uid()
  );

CREATE POLICY "pitches_insert" ON pitches FOR INSERT
  WITH CHECK (
    public.get_my_role() = 'super_admin'
    OR (organization_id = public.get_my_org_id() AND sent_by = auth.uid())
  );

CREATE POLICY "pitches_update" ON pitches FOR UPDATE
  USING (
    public.get_my_role() = 'super_admin'
    OR (
      public.get_my_role() = 'org_admin'
      AND organization_id = public.get_my_org_id()
      AND NOT public.org_admin_restricted()
    )
    OR sent_by = auth.uid()
  );

CREATE POLICY "pitches_delete" ON pitches FOR DELETE
  USING (
    public.get_my_role() = 'super_admin'
    OR (
      public.get_my_role() = 'org_admin'
      AND organization_id = public.get_my_org_id()
    )
  );

-- =============================================================================
-- FOLLOWUPS
-- =============================================================================

CREATE POLICY "followups_select" ON followups FOR SELECT
  USING (
    public.get_my_role() = 'super_admin'
    OR (
      public.get_my_role() = 'org_admin'
      AND organization_id = public.get_my_org_id()
      AND NOT public.org_admin_restricted()
    )
    OR assigned_to = auth.uid()
  );

CREATE POLICY "followups_insert" ON followups FOR INSERT
  WITH CHECK (
    public.get_my_role() = 'super_admin'
    OR organization_id = public.get_my_org_id()
  );

CREATE POLICY "followups_update" ON followups FOR UPDATE
  USING (
    public.get_my_role() = 'super_admin'
    OR (
      public.get_my_role() = 'org_admin'
      AND organization_id = public.get_my_org_id()
      AND NOT public.org_admin_restricted()
    )
    OR assigned_to = auth.uid()
  );

CREATE POLICY "followups_delete" ON followups FOR DELETE
  USING (
    public.get_my_role() = 'super_admin'
    OR (public.get_my_role() = 'org_admin' AND organization_id = public.get_my_org_id())
  );

-- =============================================================================
-- LEADS
-- =============================================================================

CREATE POLICY "leads_select" ON leads FOR SELECT
  USING (
    public.get_my_role() = 'super_admin'
    OR (
      public.get_my_role() = 'org_admin'
      AND organization_id = public.get_my_org_id()
      AND NOT public.org_admin_restricted()
    )
    OR assigned_to = auth.uid()
  );

CREATE POLICY "leads_insert" ON leads FOR INSERT
  WITH CHECK (
    public.get_my_role() = 'super_admin'
    OR organization_id = public.get_my_org_id()
  );

CREATE POLICY "leads_update" ON leads FOR UPDATE
  USING (
    public.get_my_role() = 'super_admin'
    OR (
      public.get_my_role() = 'org_admin'
      AND organization_id = public.get_my_org_id()
      AND NOT public.org_admin_restricted()
    )
    OR assigned_to = auth.uid()
  );

CREATE POLICY "leads_delete" ON leads FOR DELETE
  USING (
    public.get_my_role() = 'super_admin'
    OR (public.get_my_role() = 'org_admin' AND organization_id = public.get_my_org_id())
  );

-- =============================================================================
-- APPOINTMENTS
-- =============================================================================

CREATE POLICY "appointments_select" ON appointments FOR SELECT
  USING (
    public.get_my_role() = 'super_admin'
    OR (
      public.get_my_role() = 'org_admin'
      AND organization_id = public.get_my_org_id()
      AND NOT public.org_admin_restricted()
    )
    OR assigned_to = auth.uid()
    OR created_by = auth.uid()
  );

CREATE POLICY "appointments_insert" ON appointments FOR INSERT
  WITH CHECK (
    public.get_my_role() = 'super_admin'
    OR organization_id = public.get_my_org_id()
  );

CREATE POLICY "appointments_update" ON appointments FOR UPDATE
  USING (
    public.get_my_role() = 'super_admin'
    OR (
      public.get_my_role() = 'org_admin'
      AND organization_id = public.get_my_org_id()
      AND NOT public.org_admin_restricted()
    )
    OR assigned_to = auth.uid()
    OR created_by = auth.uid()
  );

CREATE POLICY "appointments_delete" ON appointments FOR DELETE
  USING (
    public.get_my_role() = 'super_admin'
    OR (public.get_my_role() = 'org_admin' AND organization_id = public.get_my_org_id())
  );

-- =============================================================================
-- MEETING OUTCOMES
-- =============================================================================

CREATE POLICY "meeting_outcomes_select" ON meeting_outcomes FOR SELECT
  USING (
    public.get_my_role() = 'super_admin'
    OR (public.get_my_role() = 'org_admin' AND organization_id = public.get_my_org_id())
    OR recorded_by = auth.uid()
  );

CREATE POLICY "meeting_outcomes_insert" ON meeting_outcomes FOR INSERT
  WITH CHECK (
    public.get_my_role() = 'super_admin'
    OR organization_id = public.get_my_org_id()
  );

CREATE POLICY "meeting_outcomes_update" ON meeting_outcomes FOR UPDATE
  USING (
    public.get_my_role() = 'super_admin'
    OR (public.get_my_role() = 'org_admin' AND organization_id = public.get_my_org_id())
    OR recorded_by = auth.uid()
  );

CREATE POLICY "meeting_outcomes_delete" ON meeting_outcomes FOR DELETE
  USING (
    public.get_my_role() = 'super_admin'
    OR (public.get_my_role() = 'org_admin' AND organization_id = public.get_my_org_id())
  );

-- =============================================================================
-- DEALS
-- =============================================================================

CREATE POLICY "deals_select" ON deals FOR SELECT
  USING (
    public.get_my_role() = 'super_admin'
    OR (
      public.get_my_role() = 'org_admin'
      AND organization_id = public.get_my_org_id()
      AND NOT public.org_admin_restricted()
    )
    OR assigned_to = auth.uid()
  );

CREATE POLICY "deals_insert" ON deals FOR INSERT
  WITH CHECK (
    public.get_my_role() = 'super_admin'
    OR organization_id = public.get_my_org_id()
  );

CREATE POLICY "deals_update" ON deals FOR UPDATE
  USING (
    public.get_my_role() = 'super_admin'
    OR (
      public.get_my_role() = 'org_admin'
      AND organization_id = public.get_my_org_id()
      AND NOT public.org_admin_restricted()
    )
    OR assigned_to = auth.uid()
  );

CREATE POLICY "deals_delete" ON deals FOR DELETE
  USING (
    public.get_my_role() = 'super_admin'
    OR (public.get_my_role() = 'org_admin' AND organization_id = public.get_my_org_id())
  );

-- =============================================================================
-- NOTIFICATIONS
-- Each user sees only their own; super_admin can see all
-- =============================================================================

CREATE POLICY "notifications_select" ON notifications FOR SELECT
  USING (
    public.get_my_role() = 'super_admin'
    OR user_id = auth.uid()
  );

CREATE POLICY "notifications_insert" ON notifications FOR INSERT
  WITH CHECK (
    public.get_my_role() = 'super_admin'
    OR organization_id = public.get_my_org_id()
  );

CREATE POLICY "notifications_update" ON notifications FOR UPDATE
  USING (
    public.get_my_role() = 'super_admin'
    OR user_id = auth.uid()
  );

CREATE POLICY "notifications_delete" ON notifications FOR DELETE
  USING (
    public.get_my_role() = 'super_admin'
    OR user_id = auth.uid()
  );
