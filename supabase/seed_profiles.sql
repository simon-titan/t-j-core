-- =============================================================================
-- Seed: Profiles + Testdaten
-- Führe dieses Script NACH dem manuellen Anlegen der Auth-User im Dashboard aus.
-- =============================================================================

DO $$
DECLARE
  v_org_id       UUID := 'a1000000-0000-0000-0000-000000000001';
  v_template1_id UUID := 'c1000000-0000-0000-0000-000000000001';
  v_template2_id UUID := 'c2000000-0000-0000-0000-000000000002';
  v_prospect1_id UUID := 'd1000000-0000-0000-0000-000000000001';
  v_prospect2_id UUID := 'd2000000-0000-0000-0000-000000000002';
  v_prospect3_id UUID := 'd3000000-0000-0000-0000-000000000003';
  v_pitch1_id    UUID := 'e1000000-0000-0000-0000-000000000001';
  v_pitch2_id    UUID := 'e2000000-0000-0000-0000-000000000002';
  v_pitch3_id    UUID := 'e3000000-0000-0000-0000-000000000003';

  -- Auth-User IDs aus der users-Tabelle lesen (nach E-Mail)
  v_simon_id  UUID;
  v_jana_id   UUID;
  v_max_id    UUID;
  v_tom_id    UUID;
  v_jerry_id  UUID;
BEGIN

  -- User-IDs per E-Mail suchen
  SELECT id INTO v_simon_id  FROM auth.users WHERE email = 'simon@titandevelopment.de';
  SELECT id INTO v_jana_id   FROM auth.users WHERE email = 'jana@tj-consulting.de';
  SELECT id INTO v_max_id    FROM auth.users WHERE email = 'max@tj-consulting.de';
  SELECT id INTO v_tom_id    FROM auth.users WHERE email = 'tom@tj-consulting.de';
  SELECT id INTO v_jerry_id  FROM auth.users WHERE email = 'jerry@tj-consulting.de';

  -- Prüfen ob alle User gefunden wurden
  IF v_simon_id IS NULL THEN RAISE EXCEPTION 'User simon@titandevelopment.de nicht gefunden — bitte erst im Dashboard anlegen'; END IF;
  IF v_jana_id  IS NULL THEN RAISE EXCEPTION 'User jana@tj-consulting.de nicht gefunden';   END IF;
  IF v_max_id   IS NULL THEN RAISE EXCEPTION 'User max@tj-consulting.de nicht gefunden';    END IF;
  IF v_tom_id   IS NULL THEN RAISE EXCEPTION 'User tom@tj-consulting.de nicht gefunden';    END IF;
  IF v_jerry_id IS NULL THEN RAISE EXCEPTION 'User jerry@tj-consulting.de nicht gefunden';  END IF;

  -- Organisation
  INSERT INTO organizations (id, name, slug, settings) VALUES (
    v_org_id, 'T&J Consulting', 'tj-consulting', '{"admin_visibility": "all"}'
  ) ON CONFLICT (id) DO NOTHING;

  -- Profiles mit korrekter Rolle und Org
  INSERT INTO profiles (id, organization_id, role, full_name) VALUES
    (v_simon_id, v_org_id, 'super_admin', 'Simon Paweletz'),
    (v_jana_id,  v_org_id, 'org_admin',   'Jana Admin'),
    (v_max_id,   v_org_id, 'member',      'Max Mustermann'),
    (v_tom_id,   v_org_id, 'super_admin', 'Tom Mazotti'),
    (v_jerry_id, v_org_id, 'super_admin', 'Jerry Bleich')
  ON CONFLICT (id) DO UPDATE SET
    organization_id = EXCLUDED.organization_id,
    role            = EXCLUDED.role,
    full_name       = EXCLUDED.full_name;

  -- Pitch Templates
  INSERT INTO pitch_templates (id, organization_id, created_by, name, subject, body) VALUES
    (v_template1_id, v_org_id, v_simon_id, 'LinkedIn Kaltakquise — Consulting', NULL,
     'Hallo {{first_name}},

ich bin auf dein Profil gestoßen und finde deinen Werdegang bei {{company}} sehr spannend.

Wir helfen mittelständischen Unternehmen dabei, ihre Vertriebsprozesse zu digitalisieren und skalierbar zu machen. Wäre ein kurzer Austausch interessant für dich?

Viele Grüße,
Simon'),
    (v_template2_id, v_org_id, v_simon_id, 'LinkedIn Follow-Up — Stufe 1', NULL,
     'Hallo {{first_name}},

ich wollte kurz nachhaken — hast du meine letzte Nachricht erhalten?

Falls du gerade viel um die Ohren hast, kein Problem. Ich freue mich aber auf einen kurzen Austausch, wenn es passt.

Beste Grüße,
Simon')
  ON CONFLICT (id) DO NOTHING;

  -- Prospects
  INSERT INTO prospects (id, organization_id, created_by, linkedin_url, first_name, last_name, company, position) VALUES
    (v_prospect1_id, v_org_id, v_max_id,  'https://linkedin.com/in/anna-schmidt',   'Anna',   'Schmidt', 'Muster GmbH',      'Head of Sales'),
    (v_prospect2_id, v_org_id, v_max_id,  'https://linkedin.com/in/thomas-mueller', 'Thomas', 'Müller',  'Tech AG',          'CEO'),
    (v_prospect3_id, v_org_id, v_jana_id, 'https://linkedin.com/in/lisa-braun',     'Lisa',   'Braun',   'Digital Solutions', 'Marketing Director')
  ON CONFLICT (id) DO NOTHING;

  -- Pitches
  INSERT INTO pitches (id, organization_id, prospect_id, template_id, sent_by, status, sent_at) VALUES
    (v_pitch1_id, v_org_id, v_prospect1_id, v_template1_id, v_max_id,  'sent',      NOW() - INTERVAL '7 days'),
    (v_pitch2_id, v_org_id, v_prospect2_id, v_template1_id, v_max_id,  'delivered', NOW() - INTERVAL '3 days'),
    (v_pitch3_id, v_org_id, v_prospect3_id, v_template1_id, v_jana_id, 'sent',      NOW() - INTERVAL '5 days')
  ON CONFLICT (id) DO NOTHING;

  -- Follow-Ups
  INSERT INTO followups (pitch_id, organization_id, assigned_to, level, status, scheduled_for) VALUES
    (v_pitch1_id, v_org_id, v_max_id,  1, 'pending', CURRENT_DATE + 1),
    (v_pitch1_id, v_org_id, v_max_id,  2, 'pending', CURRENT_DATE + 4),
    (v_pitch1_id, v_org_id, v_max_id,  3, 'pending', CURRENT_DATE + 8),
    (v_pitch3_id, v_org_id, v_jana_id, 1, 'pending', CURRENT_DATE)
  ON CONFLICT (pitch_id, level) DO NOTHING;

  RAISE NOTICE 'Seed erfolgreich! Organisation, Profiles, Templates, Prospects, Pitches und Follow-Ups angelegt.';
END $$;
