-- ─── Monthly Check-In Tables ────────────────────────────────────────────────

-- Sections (static, 8 entries)
CREATE TABLE public.checkin_sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  order_index INT  NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Questions (static, 24 entries from PDF)
CREATE TABLE public.checkin_questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id    UUID NOT NULL REFERENCES public.checkin_sections(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  helper_text   TEXT,
  type          TEXT NOT NULL CHECK (type IN ('text','textarea','number','scale','select')),
  options       JSONB,
  order_index   INT  NOT NULL,
  is_required   BOOL NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Answers (per user + period)
CREATE TABLE public.checkin_answers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id  UUID NOT NULL REFERENCES public.checkin_questions(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id       UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  period_year  INT  NOT NULL,
  period_month INT  NOT NULL,
  answer_text  TEXT,
  answer_json  JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (question_id, user_id, period_year, period_month)
);

-- Submissions (once per user per month)
CREATE TABLE public.checkin_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id       UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  period_year  INT  NOT NULL,
  period_month INT  NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_year, period_month)
);

-- ─── RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE public.checkin_sections    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_questions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_answers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_submissions ENABLE ROW LEVEL SECURITY;

-- Sections & Questions: readable by all authenticated users
CREATE POLICY "checkin_sections_select" ON public.checkin_sections
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "checkin_questions_select" ON public.checkin_questions
  FOR SELECT TO authenticated USING (true);

-- Answers: own rows + org_admin/super_admin of same org
CREATE POLICY "checkin_answers_select" ON public.checkin_answers
  FOR SELECT TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.organization_id = checkin_answers.org_id
        AND p.role IN ('org_admin', 'super_admin')
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

CREATE POLICY "checkin_answers_insert" ON public.checkin_answers
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.checkin_submissions s
      WHERE s.user_id = auth.uid()
        AND s.period_year  = checkin_answers.period_year
        AND s.period_month = checkin_answers.period_month
    )
  );

CREATE POLICY "checkin_answers_update" ON public.checkin_answers
  FOR UPDATE TO authenticated USING (
    user_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.checkin_submissions s
      WHERE s.user_id = auth.uid()
        AND s.period_year  = checkin_answers.period_year
        AND s.period_month = checkin_answers.period_month
    )
  );

-- Submissions: own + org_admin/super_admin; insert once only
CREATE POLICY "checkin_submissions_select" ON public.checkin_submissions
  FOR SELECT TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.organization_id = checkin_submissions.org_id
        AND p.role IN ('org_admin', 'super_admin')
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

CREATE POLICY "checkin_submissions_insert" ON public.checkin_submissions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ─── Seed Data ───────────────────────────────────────────────────────────────

DO $$
DECLARE
  s1 UUID; s2 UUID; s3 UUID; s4 UUID;
  s5 UUID; s6 UUID; s7 UUID; s8 UUID;
BEGIN

-- Section 1 – Zahlen
INSERT INTO public.checkin_sections (title, order_index)
  VALUES ('Zahlen', 1) RETURNING id INTO s1;

-- Section 2 – Umsetzung
INSERT INTO public.checkin_sections (title, order_index)
  VALUES ('Umsetzung', 2) RETURNING id INTO s2;

-- Section 3 – Content & Personal Brand
INSERT INTO public.checkin_sections (title, order_index)
  VALUES ('Content & Personal Brand', 3) RETURNING id INTO s3;

-- Section 4 – Outreach & Sales
INSERT INTO public.checkin_sections (title, order_index)
  VALUES ('Outreach & Sales', 4) RETURNING id INTO s4;

-- Section 5 – Ergebnis & Fortschritt
INSERT INTO public.checkin_sections (title, order_index)
  VALUES ('Ergebnis & Fortschritt', 5) RETURNING id INTO s5;

-- Section 6 – Engpass
INSERT INTO public.checkin_sections (title, order_index)
  VALUES ('Engpass', 6) RETURNING id INTO s6;

-- Section 7 – Feedback zur Zusammenarbeit
INSERT INTO public.checkin_sections (title, order_index)
  VALUES ('Feedback zur Zusammenarbeit', 7) RETURNING id INTO s7;

-- Section 8 – Empfehlung
INSERT INTO public.checkin_sections (title, order_index)
  VALUES ('Empfehlung', 8) RETURNING id INTO s8;

-- ── Questions Section 1 ───────────────────────────────────────────────────
INSERT INTO public.checkin_questions (section_id, question_text, helper_text, type, order_index) VALUES
  (s1, 'Wie viele Posts hast du diesen Monat veröffentlicht?',   NULL,               'number', 1),
  (s1, 'Wie viele DMs hast du geschrieben?',                     NULL,               'number', 2),
  (s1, 'Wie viele Antworten hast du bekommen?',                  NULL,               'number', 3),
  (s1, 'Wie viele Termine sind entstanden?',                     NULL,               'number', 4),
  (s1, 'Wie viele Abschlüsse hast du gemacht?',                  NULL,               'number', 5),
  (s1, 'Wie viel Umsatz kam direkt über LinkedIn?',              'In Euro angeben',  'number', 6);

-- ── Questions Section 2 ───────────────────────────────────────────────────
INSERT INTO public.checkin_questions (section_id, question_text, helper_text, type, order_index) VALUES
  (s2, 'Auf einer Skala von 1–10: Wie konsequent hast du umgesetzt?',              NULL, 'scale',    1),
  (s2, 'Was hast du konkret gut gemacht diesen Monat?',                             NULL, 'textarea', 2),
  (s2, 'Was hast du NICHT gemacht, obwohl wir es besprochen haben?',               NULL, 'textarea', 3),
  (s2, 'Woran lag das?',                                                            NULL, 'textarea', 4);

-- ── Questions Section 3 ───────────────────────────────────────────────────
INSERT INTO public.checkin_questions (section_id, question_text, helper_text, type, order_index) VALUES
  (s3, 'Welcher Post hat am besten funktioniert? (Link einfügen)',       NULL, 'text',     1),
  (s3, 'Welcher Post hat gar nicht funktioniert? (Link einfügen)',       NULL, 'text',     2),
  (s3, 'Fällt dir Content aktuell leicht oder schwer? Warum?',           NULL, 'textarea', 3);

-- ── Questions Section 4 ───────────────────────────────────────────────────
INSERT INTO public.checkin_questions (section_id, question_text, helper_text, type, options, order_index) VALUES
  (s4, 'Wie fühlen sich deine Nachrichten aktuell an?',       NULL, 'select',   '[{"value":"sicher","label":"Sicher"},{"value":"unsicher","label":"Unsicher"},{"value":"gemischt","label":"Gemischt"}]', 1),
  (s4, 'Wo bekommst du aktuell die meisten Einwände?',        NULL, 'textarea', NULL, 2),
  (s4, 'Wo brechen Gespräche am häufigsten ab?',              NULL, 'textarea', NULL, 3);

-- ── Questions Section 5 ───────────────────────────────────────────────────
INSERT INTO public.checkin_questions (section_id, question_text, helper_text, type, order_index) VALUES
  (s5, 'Was war dein größter Win diesen Monat?',                                           NULL, 'textarea', 1),
  (s5, 'Gab es konkrete Deals durch unsere Zusammenarbeit? Wenn ja, welche?',              NULL, 'textarea', 2);

-- ── Questions Section 6 ───────────────────────────────────────────────────
INSERT INTO public.checkin_questions (section_id, question_text, helper_text, type, order_index) VALUES
  (s6, 'Wenn wir nächsten Monat nur EINE Sache fixen dürften — was wäre es?', NULL, 'textarea', 1);

-- ── Questions Section 7 ───────────────────────────────────────────────────
INSERT INTO public.checkin_questions (section_id, question_text, helper_text, type, order_index) VALUES
  (s7, 'Was hat dir diesen Monat am meisten geholfen?',                    NULL, 'textarea', 1),
  (s7, 'Was war unnötig oder hätte besser sein können?',                   NULL, 'textarea', 2),
  (s7, 'Was wünschst du dir für nächsten Monat konkret?',                  NULL, 'textarea', 3);

-- ── Questions Section 8 ───────────────────────────────────────────────────
INSERT INTO public.checkin_questions (section_id, question_text, helper_text, type, options, order_index) VALUES
  (s8, 'Würdest du die Zusammenarbeit aktuell weiterempfehlen?',  NULL, 'select',   '[{"value":"ja","label":"Ja"},{"value":"nein","label":"Nein"}]', 1),
  (s8, 'Warum?',                                                  NULL, 'textarea', NULL, 2);

END $$;
