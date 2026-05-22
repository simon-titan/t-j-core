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
