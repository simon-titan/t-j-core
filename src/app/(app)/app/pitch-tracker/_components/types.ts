// Joined types for the Pitch Tracker — matches Supabase nested select responses

export type FollowupStatus = 'pending' | 'sent' | 'skipped';
export type PitchStatus    = 'sent' | 'delivered' | 'answered' | 'ignored' | 'bounced';
export type TimeRange      = '7d' | '30d' | '90d' | 'all';
export type Urgency        = 'overdue' | 'today' | 'soon' | 'future';

export interface FollowupSlot {
  id:            string;
  level:         number;
  status:        FollowupStatus;
  scheduled_for: string | null;
}

export interface PitchWithRelations {
  id:              string;
  organization_id: string;
  prospect_id:     string;
  template_id:     string | null;
  sent_by:         string;
  status:          PitchStatus;
  sent_at:         string;
  answered_at:     string | null;
  notes:           string | null;
  created_at:      string;
  updated_at:      string;
  // Joined
  prospects: {
    first_name:   string;
    last_name:    string;
    linkedin_url: string | null;
    company:      string | null;
  } | null;
  pitch_templates: { name: string } | null;
  followups: FollowupSlot[];
  leads: Array<{
    id:     string;
    status: string;
    appointments: Array<{
      id:           string;
      scheduled_at: string;
      status:       string;
    }>;
  }>;
  // Optional: sender info (joined in detail view)
  sender?: { full_name: string | null } | null;
}

export interface TemplateOption {
  id:   string;
  name: string;
  body: string;
}

export interface PendingFollowup {
  id:              string;
  pitch_id:        string;
  organization_id: string;
  assigned_to:     string | null;
  level:           number;
  status:          FollowupStatus;
  scheduled_for:   string | null;
  sent_at:         string | null;
  notes:           string | null;
  created_at:      string;
  updated_at:      string;
  // Joined
  pitches: {
    id:          string;
    sent_at:     string;
    prospects:   { first_name: string; last_name: string } | null;
    pitch_templates: { name: string } | null;
  } | null;
}

export interface TemplateWithStats {
  id:              string;
  name:            string;
  body:            string;
  target_audience: string | null;
  product_service: string | null;
  is_active:       boolean;
  created_by:      string | null;
  pitches: Array<{
    id:        string;
    status:    PitchStatus;
    sent_at:   string;
    sent_by:   string;
    leads:     Array<{ id: string }>;
    followups: Array<{ id: string; status: string }>;
  }>;
}

export interface OrgMember {
  id:         string;
  full_name:  string | null;
  avatar_url: string | null;
  role:       string;
}

// ─── Date utilities ──────────────────────────────────────────────────────────

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function formatDateFull(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function getDateParts(dateStr: string | null): { day: string; month: string } {
  if (!dateStr) return { day: '--', month: '---' };
  const d = new Date(dateStr);
  return {
    day:   d.getDate().toString(),
    month: d.toLocaleDateString('de-DE', { month: 'short' }).toUpperCase().replace('.', ''),
  };
}

export function getUrgency(scheduledFor: string | null): Urgency {
  if (!scheduledFor) return 'future';
  const d     = new Date(scheduledFor);
  const today = new Date();
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((d.getTime() - today.getTime()) / 86400000);
  if (diff < 0)  return 'overdue';
  if (diff === 0) return 'today';
  if (diff <= 2)  return 'soon';
  return 'future';
}

export function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function filterByTimeRange(pitches: PitchWithRelations[], range: TimeRange): PitchWithRelations[] {
  if (range === 'all') return pitches;
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return pitches.filter(p => new Date(p.sent_at) >= cutoff);
}

// ─── Light Version (daily stats) ───────────────────────────────────────────────

export type LightMode = 'auto' | 'manual';

/** A single editable/aggregated day. `id` is present only for stored manual rows. */
export interface DailyStatRow {
  id?:              string;
  entry_date:       string; // 'YYYY-MM-DD'
  messages_sent:    number;
  followups_sent:   number;
  replies_received: number;
  appointments_set: number;
  closings:         number;
}

/** Raw per-user data fed into the auto-aggregation. */
export interface LightRawData {
  pitches:      Array<{ sent_at: string; answered_at: string | null }>;
  followups:    Array<{ status: string; sent_at: string | null }>;
  appointments: Array<{ created_at: string }>;
  wonLeads:     Array<{ updated_at: string }>;
}

export interface DailyStatRates {
  answerRate:  number; // Erhaltene Antworten / Gesendete Nachrichten
  apptRate:    number; // Gelegte Termine / Erhaltene Antworten
  closingRate: number; // Closings / Gelegte Termine
}

/** Column headers for the Light daily-stats table (matches the screenshot). */
export const LIGHT_NUMERIC_COLUMNS = [
  { key: 'messages_sent',    label: 'Gesendete Nachrichten' },
  { key: 'followups_sent',   label: 'Gesendete Follow-ups'  },
  { key: 'replies_received', label: 'Erhaltene Antworten'   },
  { key: 'appointments_set', label: 'Gelegte Termine'       },
  { key: 'closings',         label: 'Closings'              },
] as const;

export type LightNumericKey = (typeof LIGHT_NUMERIC_COLUMNS)[number]['key'];

function roundPct(num: number, den: number): number {
  if (den <= 0) return 0;
  return Math.round((num / den) * 1000) / 10;
}

export function calcRates(r: {
  messages_sent: number;
  replies_received: number;
  appointments_set: number;
  closings: number;
}): DailyStatRates {
  return {
    answerRate:  roundPct(r.replies_received, r.messages_sent),
    apptRate:    roundPct(r.appointments_set, r.replies_received),
    closingRate: roundPct(r.closings, r.appointments_set),
  };
}

/** Local-time YYYY-MM-DD key for a timestamp. */
export function toDateKey(dateStr: string): string {
  const d   = new Date(dateStr);
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Display a YYYY-MM-DD key as DD.MM.YY. */
export function formatDateKey(key: string): string {
  const [y, m, d] = key.split('-');
  return `${d}.${m}.${y.slice(2)}`;
}

function rangeCutoff(range: TimeRange): Date | null {
  if (range === 'all') return null;
  const days   = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff;
}

/** Aggregate raw per-user data into one row per calendar day, newest first. */
export function aggregateAutoStats(raw: LightRawData, range: TimeRange): DailyStatRow[] {
  const cutoff = rangeCutoff(range);
  const within = (dateStr: string) => !cutoff || new Date(dateStr) >= cutoff;
  const map = new Map<string, DailyStatRow>();
  const ensure = (key: string): DailyStatRow => {
    let row = map.get(key);
    if (!row) {
      row = { entry_date: key, messages_sent: 0, followups_sent: 0, replies_received: 0, appointments_set: 0, closings: 0 };
      map.set(key, row);
    }
    return row;
  };

  raw.pitches.forEach(p => {
    if (within(p.sent_at)) ensure(toDateKey(p.sent_at)).messages_sent++;
    if (p.answered_at && within(p.answered_at)) ensure(toDateKey(p.answered_at)).replies_received++;
  });
  raw.followups.forEach(f => {
    if (f.status === 'sent' && f.sent_at && within(f.sent_at)) ensure(toDateKey(f.sent_at)).followups_sent++;
  });
  raw.appointments.forEach(a => {
    if (within(a.created_at)) ensure(toDateKey(a.created_at)).appointments_set++;
  });
  raw.wonLeads.forEach(l => {
    if (within(l.updated_at)) ensure(toDateKey(l.updated_at)).closings++;
  });

  return Array.from(map.values()).sort((a, b) => b.entry_date.localeCompare(a.entry_date));
}

/** Filter stored manual rows by time range, newest first. */
export function filterManualByRange(rows: DailyStatRow[], range: TimeRange): DailyStatRow[] {
  const cutoff = rangeCutoff(range);
  const filtered = cutoff
    ? rows.filter(r => new Date(`${r.entry_date}T00:00:00`) >= cutoff)
    : rows;
  return [...filtered].sort((a, b) => b.entry_date.localeCompare(a.entry_date));
}
