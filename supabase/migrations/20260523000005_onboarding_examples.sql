-- =============================================================================
-- Migration 20260523000005: Onboarding Examples — T&J CRM
-- =============================================================================

CREATE TABLE public.onboarding_examples (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  module_slug  TEXT        NOT NULL,
  title        TEXT,
  content      TEXT        NOT NULL,
  order_index  INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_onboarding_examples_slug ON public.onboarding_examples(module_slug, order_index);

ALTER TABLE public.onboarding_examples ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read examples
CREATE POLICY "read_onboarding_examples"
  ON public.onboarding_examples FOR SELECT
  TO authenticated USING (true);

-- Only super_admin can insert / update / delete
CREATE POLICY "super_admin_manage_examples"
  ON public.onboarding_examples FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
