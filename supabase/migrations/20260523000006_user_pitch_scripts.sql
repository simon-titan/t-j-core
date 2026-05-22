-- =============================================================================
-- Migration 20260523000006: User Pitch Scripts — T&J CRM
-- =============================================================================

CREATE TABLE public.user_pitch_scripts (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id       UUID        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  module_slug  TEXT        NOT NULL,
  content      TEXT        NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_slug)
);

CREATE INDEX idx_user_pitch_scripts_user ON public.user_pitch_scripts(user_id, module_slug);

ALTER TABLE public.user_pitch_scripts ENABLE ROW LEVEL SECURITY;

-- Users can read their own scripts
CREATE POLICY "own_pitch_script_select"
  ON public.user_pitch_scripts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own scripts
CREATE POLICY "own_pitch_script_insert"
  ON public.user_pitch_scripts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own scripts
CREATE POLICY "own_pitch_script_update"
  ON public.user_pitch_scripts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- org_admin / super_admin can read scripts within their org for coaching
CREATE POLICY "admin_read_pitch_scripts"
  ON public.user_pitch_scripts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('org_admin', 'super_admin')
        AND organization_id = user_pitch_scripts.org_id
    )
  );
