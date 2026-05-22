-- =============================================================================
-- Migration 20260522000003: Onboarding Module — T&J CRM
-- =============================================================================

-- ---------------------------------------------------------------------------
-- ONBOARDING_MODULES
-- ---------------------------------------------------------------------------

CREATE TABLE public.onboarding_modules (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT        NOT NULL UNIQUE,
  title         TEXT        NOT NULL,
  description   TEXT,
  icon          TEXT,
  order_index   INTEGER     NOT NULL,
  type          TEXT        NOT NULL CHECK (type IN ('workbook', 'reference')),
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_modules ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- ONBOARDING_SECTIONS
-- ---------------------------------------------------------------------------

CREATE TABLE public.onboarding_sections (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id     UUID        NOT NULL REFERENCES public.onboarding_modules(id) ON DELETE CASCADE,
  title         TEXT        NOT NULL,
  description   TEXT,
  order_index   INTEGER     NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_onboarding_sections_module ON public.onboarding_sections(module_id);

ALTER TABLE public.onboarding_sections ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- ONBOARDING_QUESTIONS
-- ---------------------------------------------------------------------------

CREATE TABLE public.onboarding_questions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id    UUID        NOT NULL REFERENCES public.onboarding_sections(id) ON DELETE CASCADE,
  module_id     UUID        NOT NULL REFERENCES public.onboarding_modules(id) ON DELETE CASCADE,
  question_text TEXT        NOT NULL,
  helper_text   TEXT,
  type          TEXT        NOT NULL CHECK (type IN ('textarea', 'text', 'checkbox_group')),
  options       JSONB,
  order_index   INTEGER     NOT NULL,
  is_required   BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_onboarding_questions_section ON public.onboarding_questions(section_id);
CREATE INDEX idx_onboarding_questions_module  ON public.onboarding_questions(module_id);

ALTER TABLE public.onboarding_questions ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- ONBOARDING_ANSWERS
-- ---------------------------------------------------------------------------

CREATE TABLE public.onboarding_answers (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id   UUID        NOT NULL REFERENCES public.onboarding_questions(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id        UUID        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  answer_text   TEXT,
  answer_json   JSONB,
  visibility    TEXT        NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'team')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_onboarding_answers_user_org ON public.onboarding_answers(user_id, org_id);
CREATE INDEX idx_onboarding_answers_question ON public.onboarding_answers(question_id);

ALTER TABLE public.onboarding_answers ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- ONBOARDING_ADMIN_NOTES
-- ---------------------------------------------------------------------------

CREATE TABLE public.onboarding_admin_notes (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id    UUID        NOT NULL REFERENCES public.onboarding_questions(id) ON DELETE CASCADE,
  target_user_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id         UUID        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  note_text      TEXT        NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_onboarding_admin_notes_org         ON public.onboarding_admin_notes(org_id);
CREATE INDEX idx_onboarding_admin_notes_target_user ON public.onboarding_admin_notes(target_user_id);

ALTER TABLE public.onboarding_admin_notes ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- RLS: onboarding_modules — read-only für alle eingeloggten User
-- ---------------------------------------------------------------------------

CREATE POLICY "onboarding_modules_select" ON public.onboarding_modules
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ---------------------------------------------------------------------------
-- RLS: onboarding_sections — read-only für alle eingeloggten User
-- ---------------------------------------------------------------------------

CREATE POLICY "onboarding_sections_select" ON public.onboarding_sections
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ---------------------------------------------------------------------------
-- RLS: onboarding_questions — read-only für alle eingeloggten User
-- ---------------------------------------------------------------------------

CREATE POLICY "onboarding_questions_select" ON public.onboarding_questions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ---------------------------------------------------------------------------
-- RLS: onboarding_answers
-- ---------------------------------------------------------------------------

-- SELECT:
--   - Eigene Antworten immer sichtbar
--   - visibility='team': alle User der gleichen Org können lesen
--   - visibility='private': nur self + org_admin (gleiche Org) + super_admin
CREATE POLICY "onboarding_answers_select" ON public.onboarding_answers
  FOR SELECT USING (
    user_id = auth.uid()
    OR (
      visibility = 'team'
      AND org_id = public.get_my_org_id()
    )
    OR (
      visibility = 'private'
      AND (
        public.get_my_role() = 'super_admin'
        OR (public.get_my_role() = 'org_admin' AND org_id = public.get_my_org_id())
      )
    )
  );

CREATE POLICY "onboarding_answers_insert" ON public.onboarding_answers
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND org_id = public.get_my_org_id()
  );

CREATE POLICY "onboarding_answers_update" ON public.onboarding_answers
  FOR UPDATE USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- RLS: onboarding_admin_notes — nur org_admin + super_admin
-- ---------------------------------------------------------------------------

CREATE POLICY "onboarding_admin_notes_select" ON public.onboarding_admin_notes
  FOR SELECT USING (
    public.get_my_role() = 'super_admin'
    OR (public.get_my_role() = 'org_admin' AND org_id = public.get_my_org_id())
  );

CREATE POLICY "onboarding_admin_notes_insert" ON public.onboarding_admin_notes
  FOR INSERT WITH CHECK (
    admin_id = auth.uid()
    AND (
      public.get_my_role() = 'super_admin'
      OR (public.get_my_role() = 'org_admin' AND org_id = public.get_my_org_id())
    )
  );

CREATE POLICY "onboarding_admin_notes_update" ON public.onboarding_admin_notes
  FOR UPDATE USING (
    public.get_my_role() = 'super_admin'
    OR (public.get_my_role() = 'org_admin' AND org_id = public.get_my_org_id())
  );

-- ---------------------------------------------------------------------------
-- TRIGGERS: updated_at
-- ---------------------------------------------------------------------------

CREATE TRIGGER tr_updated_at_onboarding_answers
  BEFORE UPDATE ON public.onboarding_answers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tr_updated_at_onboarding_admin_notes
  BEFORE UPDATE ON public.onboarding_admin_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
