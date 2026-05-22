-- =============================================================================
-- Seed: Local Development Data — T&J CRM
-- =============================================================================
-- Run AFTER all migrations. Uses fixed UUIDs for predictable test queries.
--
-- Users must be created in auth.users before profiles can be inserted.
-- In local dev (supabase start), use the Supabase Studio Auth tab or:
--   supabase db seed --seed-file supabase/seed.sql
--
-- Auth users are created via supabase/seed_auth.sql or Inbucket test emails.
-- These profile rows assume the auth.users rows already exist.
-- =============================================================================

-- Fixed UUIDs for stable test references
DO $$
DECLARE
  v_org_id       UUID := 'a1000000-0000-0000-0000-000000000001';
  v_super_id     UUID := 'b1000000-0000-0000-0000-000000000001';
  v_admin_id     UUID := 'b2000000-0000-0000-0000-000000000002';
  v_member_id    UUID := 'b3000000-0000-0000-0000-000000000003';
  v_template1_id UUID := 'c1000000-0000-0000-0000-000000000001';
  v_template2_id UUID := 'c2000000-0000-0000-0000-000000000002';
  v_prospect1_id UUID := 'd1000000-0000-0000-0000-000000000001';
  v_prospect2_id UUID := 'd2000000-0000-0000-0000-000000000002';
  v_prospect3_id UUID := 'd3000000-0000-0000-0000-000000000003';
  v_pitch1_id    UUID := 'e1000000-0000-0000-0000-000000000001';
  v_pitch2_id    UUID := 'e2000000-0000-0000-0000-000000000002';
  v_pitch3_id    UUID := 'e3000000-0000-0000-0000-000000000003';
  v_tom_id       UUID := 'b4000000-0000-0000-0000-000000000004';
  v_jerry_id     UUID := 'b5000000-0000-0000-0000-000000000005';
BEGIN

  -- Organization must exist before auth.users (trigger fn_handle_new_user references it)
  INSERT INTO organizations (id, name, slug, settings) VALUES (
    v_org_id,
    'T&J Consulting',
    'tj-consulting',
    '{"admin_visibility": "all"}'
  ) ON CONFLICT (id) DO NOTHING;

  -- Auth Users — raw_user_meta_data populated so the trigger can create profiles correctly
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, role, raw_app_meta_data, raw_user_meta_data, aud)
  VALUES
    (v_super_id,  'simon@titandevelopment.de', crypt('Dev1234!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', '{"provider":"email","providers":["email"]}', '{"organization_id":"a1000000-0000-0000-0000-000000000001","role":"super_admin","full_name":"Simon Paweletz"}', 'authenticated'),
    (v_admin_id,  'jana@tj-consulting.de',     crypt('Dev1234!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', '{"provider":"email","providers":["email"]}', '{"organization_id":"a1000000-0000-0000-0000-000000000001","role":"org_admin","full_name":"Jana Admin"}',     'authenticated'),
    (v_member_id, 'max@tj-consulting.de',      crypt('Dev1234!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', '{"provider":"email","providers":["email"]}', '{"organization_id":"a1000000-0000-0000-0000-000000000001","role":"member","full_name":"Max Mustermann"}',     'authenticated'),
    (v_tom_id,    'tom@tj-consulting.de',      crypt('Dev1234!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', '{"provider":"email","providers":["email"]}', '{"organization_id":"a1000000-0000-0000-0000-000000000001","role":"super_admin","full_name":"Tom Mazotti"}',   'authenticated'),
    (v_jerry_id,  'jerry@tj-consulting.de',    crypt('Dev1234!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', '{"provider":"email","providers":["email"]}', '{"organization_id":"a1000000-0000-0000-0000-000000000001","role":"super_admin","full_name":"Jerry Bleich"}',  'authenticated')
  ON CONFLICT (id) DO NOTHING;

  -- Profiles (auth.users rows must exist first)
  INSERT INTO profiles (id, organization_id, role, full_name) VALUES
    (v_super_id,  v_org_id, 'super_admin', 'Simon Paweletz'),
    (v_admin_id,  v_org_id, 'org_admin',   'Jana Admin'),
    (v_member_id, v_org_id, 'member',      'Max Mustermann'),
    (v_tom_id,    v_org_id, 'super_admin', 'Tom Mazotti'),
    (v_jerry_id,  v_org_id, 'super_admin', 'Jerry Bleich')
  ON CONFLICT (id) DO NOTHING;

  -- Pitch Templates
  INSERT INTO pitch_templates (id, organization_id, created_by, name, subject, body) VALUES
    (
      v_template1_id,
      v_org_id,
      v_super_id,
      'LinkedIn Kaltakquise — Consulting',
      NULL,
      'Hallo {{first_name}},

ich bin auf dein Profil gestoßen und finde deinen Werdegang bei {{company}} sehr spannend.

Wir helfen mittelständischen Unternehmen dabei, ihre Vertriebsprozesse zu digitalisieren und skalierbar zu machen. Wäre ein kurzer Austausch interessant für dich?

Viele Grüße,
Simon'
    ),
    (
      v_template2_id,
      v_org_id,
      v_super_id,
      'LinkedIn Follow-Up — Stufe 1',
      NULL,
      'Hallo {{first_name}},

ich wollte kurz nachhaken — hast du meine letzte Nachricht erhalten?

Falls du gerade viel um die Ohren hast, kein Problem. Ich freue mich aber auf einen kurzen Austausch, wenn es passt.

Beste Grüße,
Simon'
    )
  ON CONFLICT (id) DO NOTHING;

  -- Prospects
  INSERT INTO prospects (id, organization_id, created_by, linkedin_url, first_name, last_name, company, position) VALUES
    (
      v_prospect1_id, v_org_id, v_member_id,
      'https://linkedin.com/in/anna-schmidt',
      'Anna', 'Schmidt', 'Muster GmbH', 'Head of Sales'
    ),
    (
      v_prospect2_id, v_org_id, v_member_id,
      'https://linkedin.com/in/thomas-mueller',
      'Thomas', 'Müller', 'Tech AG', 'CEO'
    ),
    (
      v_prospect3_id, v_org_id, v_admin_id,
      'https://linkedin.com/in/lisa-braun',
      'Lisa', 'Braun', 'Digital Solutions', 'Marketing Director'
    )
  ON CONFLICT (id) DO NOTHING;

  -- Pitches
  INSERT INTO pitches (id, organization_id, prospect_id, template_id, sent_by, status, sent_at) VALUES
    (v_pitch1_id, v_org_id, v_prospect1_id, v_template1_id, v_member_id, 'sent',      NOW() - INTERVAL '7 days'),
    (v_pitch2_id, v_org_id, v_prospect2_id, v_template1_id, v_member_id, 'delivered', NOW() - INTERVAL '3 days'),
    (v_pitch3_id, v_org_id, v_prospect3_id, v_template1_id, v_admin_id,  'sent',      NOW() - INTERVAL '5 days')
  ON CONFLICT (id) DO NOTHING;

  -- Follow-Ups for pitch 1 (all 3 levels)
  INSERT INTO followups (pitch_id, organization_id, assigned_to, level, status, scheduled_for) VALUES
    (v_pitch1_id, v_org_id, v_member_id, 1, 'pending', CURRENT_DATE + 1),
    (v_pitch1_id, v_org_id, v_member_id, 2, 'pending', CURRENT_DATE + 4),
    (v_pitch1_id, v_org_id, v_member_id, 3, 'pending', CURRENT_DATE + 8)
  ON CONFLICT (pitch_id, level) DO NOTHING;

  -- Follow-Up for pitch 3 (only level 1, due today — triggers generate_due_notifications)
  INSERT INTO followups (pitch_id, organization_id, assigned_to, level, status, scheduled_for) VALUES
    (v_pitch3_id, v_org_id, v_admin_id, 1, 'pending', CURRENT_DATE)
  ON CONFLICT (pitch_id, level) DO NOTHING;

END $$;
