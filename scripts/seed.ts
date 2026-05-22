/**
 * T&J CRM — Development Seed Script
 * Run: npx ts-node --project scripts/tsconfig.json scripts/seed.ts
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL          = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Fixed UUIDs ──────────────────────────────────────────────────────────────
const ORG1_ID   = 'a1000000-0000-0000-0000-000000000001';
const ORG2_ID   = 'a2000000-0000-0000-0000-000000000002';
const SIMON_ID  = 'b1000000-0000-0000-0000-000000000001';
const JANA_ID   = 'b2000000-0000-0000-0000-000000000002';
const MAX_ID    = 'b3000000-0000-0000-0000-000000000003';
const TOM_ID    = 'b4000000-0000-0000-0000-000000000004';
const JERRY_ID  = 'b5000000-0000-0000-0000-000000000005';
// Org2 users
const LISA_ID   = 'b6000000-0000-0000-0000-000000000006';
const MARC_ID   = 'b7000000-0000-0000-0000-000000000007';

const TMPL1_ID  = 'c1000000-0000-0000-0000-000000000001';
const TMPL2_ID  = 'c2000000-0000-0000-0000-000000000002';
const TMPL3_ID  = 'c3000000-0000-0000-0000-000000000003';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Step 1: Auth Users ───────────────────────────────────────────────────────
async function createAuthUsers() {
  console.log('Creating auth users…');
  const users = [
    { id: SIMON_ID, email: 'simon@titandevelopment.de', name: 'Simon Paweletz', role: 'super_admin', org: ORG1_ID },
    { id: JANA_ID,  email: 'jana@tj-consulting.de',    name: 'Jana Admin',      role: 'org_admin',   org: ORG1_ID },
    { id: MAX_ID,   email: 'max@tj-consulting.de',     name: 'Max Mustermann',  role: 'member',      org: ORG1_ID },
    { id: TOM_ID,   email: 'tom@tj-consulting.de',     name: 'Tom Mazotti',     role: 'super_admin', org: ORG1_ID },
    { id: JERRY_ID, email: 'jerry@tj-consulting.de',   name: 'Jerry Bleich',    role: 'super_admin', org: ORG1_ID },
    { id: LISA_ID,  email: 'lisa@demo-gmbh.de',        name: 'Lisa Berger',     role: 'org_admin',   org: ORG2_ID },
    { id: MARC_ID,  email: 'marc@demo-gmbh.de',        name: 'Marc Schreiber',  role: 'member',      org: ORG2_ID },
  ];

  for (const u of users) {
    const { error } = await supabase.auth.admin.createUser({
      user_metadata: { organization_id: u.org, role: u.role, full_name: u.name },
      email:         u.email,
      password:      'Dev1234!',
      email_confirm: true,
    });
    if (error && !error.message.includes('already been registered')) {
      console.warn(`  ⚠ ${u.email}: ${error.message}`);
    } else {
      console.log(`  ✓ ${u.email}`);
    }
  }
}

// ─── Step 2: Organizations ────────────────────────────────────────────────────
async function createOrganizations() {
  console.log('Creating organizations…');
  const { error } = await supabase.from('organizations').upsert([
    { id: ORG1_ID, name: 'T&J Consulting', slug: 'tj-consulting', settings: { admin_visibility: 'all' } },
    { id: ORG2_ID, name: 'Demo GmbH',      slug: 'demo-gmbh',     settings: { admin_visibility: 'own' } },
  ], { onConflict: 'id' });
  if (error) console.error('  ✗ orgs:', error.message);
  else console.log('  ✓ 2 organizations');
}

// ─── Step 3: Pitch Templates ──────────────────────────────────────────────────
async function createTemplates() {
  console.log('Creating pitch templates…');
  const { error } = await supabase.from('pitch_templates').upsert([
    {
      id: TMPL1_ID, organization_id: ORG1_ID, created_by: SIMON_ID,
      name: 'LinkedIn Kaltakquise — Consulting', is_active: true,
      body: 'Hallo {{first_name}},\n\nIch bin auf dein Profil gestoßen und finde deinen Werdegang bei {{company}} spannend.\n\nWir helfen mittelständischen Unternehmen dabei, ihre Vertriebsprozesse zu digitalisieren. Wäre ein kurzer Austausch interessant?\n\nViele Grüße,\nSimon',
    },
    {
      id: TMPL2_ID, organization_id: ORG1_ID, created_by: SIMON_ID,
      name: 'Follow-Up Stufe 1', is_active: true,
      body: 'Hallo {{first_name}},\n\nich wollte kurz nachhaken – hast du meine letzte Nachricht erhalten?\n\nFalls du gerade viel um die Ohren hast, kein Problem. Ich freue mich auf einen kurzen Austausch wenn es passt.\n\nBeste Grüße,\nSimon',
    },
    {
      id: TMPL3_ID, organization_id: ORG1_ID, created_by: JANA_ID,
      name: 'LinkedIn Kaltakquise — HR', is_active: true,
      body: 'Hallo {{first_name}},\n\nIch arbeite mit Unternehmen wie {{company}} zusammen, um Recruiting-Prozesse skalierbarer zu machen.\n\nGibt es aktuell Herausforderungen bei eurer Personalgewinnung?\n\nViele Grüße,\nJana',
    },
  ], { onConflict: 'id' });
  if (error) console.error('  ✗ templates:', error.message);
  else console.log('  ✓ 3 templates');
}

// ─── Step 4: Prospects ────────────────────────────────────────────────────────
const PROSPECT_DATA = [
  { first: 'Anna',    last: 'Schmidt',   company: 'Muster GmbH',      position: 'Head of Sales',       linkedin: 'anna-schmidt' },
  { first: 'Thomas',  last: 'Müller',    company: 'Tech AG',           position: 'CEO',                 linkedin: 'thomas-mueller-tech' },
  { first: 'Lisa',    last: 'Braun',     company: 'Digital Solutions', position: 'Marketing Director',  linkedin: 'lisa-braun-ds' },
  { first: 'Klaus',   last: 'Wagner',    company: 'Wagner & Co.',      position: 'Geschäftsführer',     linkedin: 'kw-wagnercco' },
  { first: 'Sophie',  last: 'Klein',     company: 'StartupHub',        position: 'COO',                 linkedin: 'sophie-klein' },
  { first: 'Felix',   last: 'Bauer',     company: 'BauerTech',         position: 'CTO',                 linkedin: 'felix-bauer-tech' },
  { first: 'Maria',   last: 'Huber',     company: 'Consulting Pro',    position: 'Managing Partner',    linkedin: 'maria-huber-cp' },
  { first: 'Jonas',   last: 'Koch',      company: 'Digital First',     position: 'Head of Growth',      linkedin: 'jonas-koch-df' },
  { first: 'Elena',   last: 'Wolf',      company: 'Wolf Systems',      position: 'VP Sales',            linkedin: 'elena-wolf-sys' },
  { first: 'Stefan',  last: 'Richter',   company: 'Richter Partners',  position: 'Partner',             linkedin: 'stefan-richter-p' },
  { first: 'Laura',   last: 'Fischer',   company: 'Fischer & Friends', position: 'CEO',                 linkedin: 'laura-fischer-ff' },
  { first: 'David',   last: 'Neumann',   company: 'N Digital',         position: 'Founder',             linkedin: 'david-neumann-nd' },
  { first: 'Sandra',  last: 'Zimmermann', company: 'ZimCorp',          position: 'Head of Business',    linkedin: 'sandra-zimm' },
  { first: 'Michael', last: 'Schwarz',   company: 'Schwarz Ventures',  position: 'Managing Director',   linkedin: 'michael-schwarz-v' },
  { first: 'Julia',   last: 'Hartmann',  company: 'Hartmann & Söhne',  position: 'Vertriebsleiterin',   linkedin: 'julia-hartmann' },
  { first: 'Patrick', last: 'Schulz',    company: 'SchulzBiz',         position: 'CEO',                 linkedin: 'patrick-schulz-biz' },
  { first: 'Sabine',  last: 'Lange',     company: 'Lange Solutions',   position: 'Partner',             linkedin: 'sabine-lange-sol' },
  { first: 'Markus',  last: 'Werner',    company: 'Werner Digital',    position: 'Head of Marketing',   linkedin: 'markus-werner-d' },
  { first: 'Claudia', last: 'Krause',    company: 'Krause GmbH',       position: 'Geschäftsführerin',   linkedin: 'claudia-krause' },
  { first: 'Andreas', last: 'König',     company: 'KönigTech',         position: 'CTO',                 linkedin: 'andreas-koenig-t' },
];

async function createProspects(): Promise<string[]> {
  console.log('Creating prospects…');
  const rows = PROSPECT_DATA.map((p, i) => ({
    id:           `d${String(i + 1).padStart(7, '0')}-0000-0000-0000-000000000001`,
    organization_id: ORG1_ID,
    created_by:   randomItem([MAX_ID, JANA_ID, SIMON_ID]),
    first_name:   p.first,
    last_name:    p.last,
    company:      p.company,
    position:     p.position,
    linkedin_url: `https://linkedin.com/in/${p.linkedin}`,
    industry:     randomItem(['SaaS', 'Consulting', 'E-Commerce', 'FinTech', 'HR-Tech', 'Manufacturing']),
    company_size: randomItem(['1-10', '11-50', '51-200', '201-500']),
  }));

  const { error } = await supabase.from('prospects').upsert(rows, { onConflict: 'id' });
  if (error) { console.error('  ✗ prospects:', error.message); return []; }
  console.log(`  ✓ ${rows.length} prospects`);
  return rows.map(r => r.id);
}

// ─── Step 5: Pitches (50) ─────────────────────────────────────────────────────
const PITCH_STATUSES = ['sent', 'delivered', 'answered', 'ignored', 'bounced'] as const;

async function createPitches(prospectIds: string[]): Promise<string[]> {
  console.log('Creating 50 pitches…');
  const pitchRows = prospectIds.slice(0, 20).flatMap((pId, i) => {
    const count = i < 5 ? 3 : i < 10 ? 2 : 1;
    return Array.from({ length: count }, (_, j) => ({
      id:              `e${String(i * 3 + j + 1).padStart(7, '0')}-0000-0000-0000-000000000001`,
      organization_id: ORG1_ID,
      prospect_id:     pId,
      template_id:     randomItem([TMPL1_ID, TMPL2_ID, TMPL3_ID]),
      sent_by:         randomItem([MAX_ID, JANA_ID, SIMON_ID]),
      status:          randomItem(PITCH_STATUSES),
      sent_at:         daysAgo(randomInt(1, 90)),
      answered_at:     null,
    }));
  });

  // Trim to 50
  const rows = pitchRows.slice(0, 50).map((r, i) => ({
    ...r,
    id: `e${String(i + 1).padStart(7, '0')}-0000-0000-0000-000000000001`,
    answered_at: r.status === 'answered' ? daysAgo(randomInt(1, 30)) : null,
  }));

  const { error } = await supabase.from('pitches').upsert(rows, { onConflict: 'id' });
  if (error) { console.error('  ✗ pitches:', error.message); return []; }
  console.log(`  ✓ ${rows.length} pitches`);

  // Followups for first 15 pitches
  const followupRows = rows.slice(0, 15).flatMap((p, i) => {
    const levels = i < 5 ? [1, 2, 3] : i < 10 ? [1, 2] : [1];
    return levels.map(level => ({
      pitch_id:        p.id,
      organization_id: ORG1_ID,
      assigned_to:     p.sent_by,
      level,
      status:          level === 1 && i < 3 ? 'sent' : 'pending',
      scheduled_for:   new Date(Date.now() + (level * 3 - randomInt(0, 5)) * 86400000).toISOString().split('T')[0],
    }));
  });

  const { error: fuErr } = await supabase.from('followups').upsert(followupRows, { onConflict: 'pitch_id,level' });
  if (fuErr) console.warn('  ⚠ followups:', fuErr.message);
  else console.log(`  ✓ ${followupRows.length} followups`);

  return rows.map(r => r.id);
}

// ─── Step 6: CRM Leads + Appointments (20) ───────────────────────────────────
const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'negotiating', 'won', 'lost'] as const;
const PAIN_POINTS = [
  'Zu wenig qualifizierte Leads, kein systematischer Prozess',
  'Vertrieb läuft ausschließlich über Empfehlungen',
  'CRM wird nicht konsequent genutzt',
  'Follow-Up wird vergessen oder zu spät gemacht',
  'Keine klare Positionierung im Markt',
];

async function createLeads(prospectIds: string[]) {
  console.log('Creating 20 CRM leads…');
  const COLUMNS_BY_STATUS: Record<string, string[]> = {
    anstehend:       ['new', 'contacted'],
    heute_fällig:    ['qualified'],
    neu_terminieren: ['proposal'],
    closed:          ['won'],
    rejected:        ['lost'],
  };
  const columns = Object.keys(COLUMNS_BY_STATUS);

  const leadRows = prospectIds.slice(0, 20).map((pId, i) => {
    const col    = columns[i % 5];
    const status = randomItem(COLUMNS_BY_STATUS[col]);
    return {
      id:              `f${String(i + 1).padStart(7, '0')}-0000-0000-0000-000000000001`,
      organization_id: ORG1_ID,
      prospect_id:     pId,
      assigned_to:     randomItem([MAX_ID, JANA_ID]),
      status,
      meeting_system:  randomItem(['direct', 'two_meeting']),
      pain_points:     randomItem(PAIN_POINTS),
      objections:      i % 3 === 0 ? 'Kein Budget aktuell' : null,
      notes:           i % 4 === 0 ? 'Sehr interessiert, nächsten Schritt klären' : null,
      created_at:      daysAgo(randomInt(5, 60)),
    };
  });

  const { error } = await supabase.from('leads').upsert(leadRows, { onConflict: 'id' });
  if (error) { console.error('  ✗ leads:', error.message); return; }
  console.log(`  ✓ ${leadRows.length} leads`);

  // Appointments for leads 0-13 (won/proposal/qualified)
  const apptRows = leadRows.slice(0, 14).map((l, i) => ({
    id:              `g${String(i + 1).padStart(7, '0')}-0000-0000-0000-000000000001`,
    organization_id: ORG1_ID,
    lead_id:         l.id,
    created_by:      l.assigned_to,
    assigned_to:     l.assigned_to,
    title:           randomItem(['Discovery Call', 'Demo', 'Proposal Präsentation', 'Closing Call']),
    scheduled_at:    daysAgo(randomInt(-7, 30)),
    duration_minutes: randomItem([30, 45, 60]),
    status:          i < 8 ? 'completed' : 'scheduled',
    meeting_type:    randomItem(['discovery', 'demo', 'proposal', 'closing']),
  }));

  const { error: apptErr } = await supabase.from('appointments').upsert(apptRows, { onConflict: 'id' });
  if (apptErr) console.warn('  ⚠ appointments:', apptErr.message);
  else console.log(`  ✓ ${apptRows.length} appointments`);

  // Meeting outcomes for completed appointments
  const outcomeRows = apptRows.filter(a => a.status === 'completed').map((a, i) => ({
    id:              `h${String(i + 1).padStart(7, '0')}-0000-0000-0000-000000000001`,
    organization_id: ORG1_ID,
    appointment_id:  a.id,
    recorded_by:     a.assigned_to,
    outcome:         randomItem(['interested', 'follow_up_needed', 'proposal_requested', 'closed_won']),
    summary:         'Gespräch verlief sehr gut. Interesse ist klar vorhanden.',
    next_steps:      'Angebot bis Ende der Woche senden.',
  }));

  const { error: outErr } = await supabase.from('meeting_outcomes').upsert(outcomeRows, { onConflict: 'id' });
  if (outErr) console.warn('  ⚠ meeting_outcomes:', outErr.message);
  else console.log(`  ✓ ${outcomeRows.length} meeting outcomes`);

  // Deals for leads in won/negotiating status
  const dealLeads = leadRows.filter(l => ['won', 'negotiating'].includes(l.status));
  if (dealLeads.length > 0) {
    const dealRows = dealLeads.map((l, i) => ({
      id:              `i${String(i + 1).padStart(7, '0')}-0000-0000-0000-000000000001`,
      organization_id: ORG1_ID,
      lead_id:         l.id,
      name:            'T&J Consulting Paket',
      assigned_to:     l.assigned_to,
      value:           randomItem([3500, 5000, 7500, 12000]),
      currency:        'EUR',
      stage:           l.status === 'won' ? 'closed_won' : 'negotiation',
      probability:     l.status === 'won' ? 100 : randomInt(60, 85),
    }));

    const { error: dealErr } = await supabase.from('deals').upsert(dealRows, { onConflict: 'id' });
    if (dealErr) console.warn('  ⚠ deals:', dealErr.message);
    else console.log(`  ✓ ${dealRows.length} deals`);
  }
}

// ─── Step 7: Onboarding Answers ───────────────────────────────────────────────
async function createOnboardingAnswers() {
  console.log('Creating onboarding answers…');

  // Fetch questions
  const { data: questions, error: qErr } = await supabase
    .from('onboarding_questions')
    .select('id, module_id, order_index')
    .order('order_index');

  if (qErr || !questions || questions.length === 0) {
    console.warn('  ⚠ No onboarding questions found — run tj_workbook_seed.sql first');
    return;
  }

  const totalQ = questions.length;

  // Simon: 100% (all questions answered)
  const simonAnswers = questions.map(q => ({
    user_id:     SIMON_ID,
    question_id: q.id,
    answer_text: 'Diese Frage habe ich vollständig beantwortet. Wir helfen mittelständischen Unternehmen, ihren Vertrieb zu digitalisieren und skalierbar zu machen.',
    is_visible:  true,
  }));

  // Max: ~50% (first half answered)
  const maxAnswers = questions.slice(0, Math.floor(totalQ / 2)).map(q => ({
    user_id:     MAX_ID,
    question_id: q.id,
    answer_text: 'Teilweise bearbeitet — noch in Arbeit.',
    is_visible:  true,
  }));

  // Jana: 0% (no answers — just exists as user)

  const allAnswers = [...simonAnswers, ...maxAnswers];

  const { error } = await supabase
    .from('onboarding_answers')
    .upsert(allAnswers, { onConflict: 'user_id,question_id' });

  if (error) console.error('  ✗ onboarding_answers:', error.message);
  else console.log(`  ✓ ${allAnswers.length} onboarding answers (Simon: 100%, Max: 50%, Jana: 0%)`);

  // Admin notes on first 5 questions (from Simon as admin)
  if (questions.length >= 5) {
    const noteRows = questions.slice(0, 5).map((q, i) => ({
      user_id:     MAX_ID,
      question_id: q.id,
      note_text:   [
        'Super Antwort! Noch etwas konkreter formulieren.',
        'Bitte die Zielgruppe noch schärfer eingrenzen.',
        'Gut durchdacht — zeig uns das im nächsten Call.',
        'Diese Antwort können wir direkt als Grundlage nutzen.',
        'Weiter so! Fast fertig mit diesem Modul.',
      ][i],
      author_id:   SIMON_ID,
    }));

    const { error: noteErr } = await supabase
      .from('onboarding_answer_notes')
      .upsert(noteRows, { onConflict: 'user_id,question_id,author_id' })
      .catch(() => ({ error: { message: 'notes table may not exist yet' } }));

    if (noteErr) console.warn('  ⚠ admin notes:', (noteErr as any).message);
    else console.log(`  ✓ 5 admin notes`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🌱 T&J CRM Seed Script\n' + '='.repeat(40));

  await createOrganizations();
  await createAuthUsers();
  await createTemplates();
  const prospectIds = await createProspects();
  if (prospectIds.length === 0) { console.error('No prospects created — aborting'); process.exit(1); }
  await createPitches(prospectIds);
  await createLeads(prospectIds);
  await createOnboardingAnswers();

  console.log('\n✅ Seed complete!\n');
  console.log('Login credentials (all users): password = Dev1234!');
  console.log('  simon@titandevelopment.de  → super_admin');
  console.log('  jana@tj-consulting.de      → org_admin');
  console.log('  max@tj-consulting.de       → member');
  console.log('  tom@tj-consulting.de       → super_admin');
  console.log('  jerry@tj-consulting.de     → super_admin');
}

main().catch(err => { console.error(err); process.exit(1); });
