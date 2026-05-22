export type KanbanColumn = 'anstehend' | 'heute_fällig' | 'neu_terminieren' | 'closed' | 'rejected';
export type NoteType = 'note' | 'action' | 'question' | 'objection' | 'insight';

export const NOTE_TYPE_CONFIG: Record<NoteType, { label: string; color: string; bg: string; border: string }> = {
  note:      { label: 'Notiz',      color: 'var(--ink)',    bg: 'var(--paper)',              border: 'var(--mist)' },
  action:    { label: 'Aufgabe',    color: '#92400E',       bg: 'rgba(251,191,36,0.08)',     border: 'rgba(251,191,36,0.25)' },
  question:  { label: 'Frage',      color: '#1E40AF',       bg: 'rgba(59,130,246,0.07)',     border: 'rgba(59,130,246,0.20)' },
  objection: { label: 'Einwand',    color: '#991B1B',       bg: 'rgba(239,68,68,0.06)',      border: 'rgba(239,68,68,0.20)' },
  insight:   { label: 'Erkenntnis', color: 'var(--forest)', bg: 'rgba(74,124,92,0.08)',      border: 'rgba(74,124,92,0.20)' },
};

export interface MeetingNote {
  id: string;
  appointment_id: string;
  organization_id: string;
  created_by: string | null;
  note_type: NoteType;
  content: string;
  created_at: string;
  updated_at: string;
}
export type ViewMode = 'kanban' | 'list' | 'calendar';

export interface OrgProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface FilterState {
  search: string;
  assignees: string[];
  meetingTypes: MeetingType[];
  industries: string[];
  companySizes: string[];
}

export const EMPTY_FILTER: FilterState = {
  search: '',
  assignees: [],
  meetingTypes: [],
  industries: [],
  companySizes: [],
};

export function isFilterActive(f: FilterState): boolean {
  return (
    f.search !== '' ||
    f.assignees.length > 0 ||
    f.meetingTypes.length > 0 ||
    f.industries.length > 0 ||
    f.companySizes.length > 0
  );
}

export type MeetingType = 'discovery' | 'demo' | 'proposal' | 'closing' | 'follow_up' | 'other';
export type MeetingSystem = 'direct' | 'two_meeting';

export type AppointmentStatus = 'scheduled' | 'completed' | 'rescheduled' | 'cancelled' | 'no_show';

export type MeetingOutcomeType =
  | 'interested'
  | 'not_interested'
  | 'follow_up_needed'
  | 'proposal_requested'
  | 'closed_won'
  | 'closed_lost';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiating'
  | 'won'
  | 'lost';

export interface KanbanProspect {
  id: string;
  first_name: string;
  last_name: string;
  company: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  website: string | null;
  industry: string | null;
  company_size: string | null;
}

export interface KanbanMeetingOutcome {
  id: string;
  outcome: MeetingOutcomeType;
  summary: string | null;
  next_steps: string | null;
  created_at: string;
}

export interface KanbanAppointment {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number | null;
  location: string | null;
  status: AppointmentStatus;
  meeting_type: MeetingType | null;
  previous_scheduled_at: string | null;
  notes: string | null;
  meeting_outcomes: KanbanMeetingOutcome[];
  meeting_notes: MeetingNote[];
}

export interface KanbanDeal {
  id: string;
  name: string;
  value: number | null;
  currency: string;
  stage: string;
  probability: number | null;
  expected_close_date: string | null;
}

export interface KanbanLead {
  id: string;
  status: LeadStatus;
  meeting_system: MeetingSystem | null;
  pain_points: string | null;
  objections: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  assigned_to: string | null;
  organization_id: string;
  prospect_id: string;
  prospect: KanbanProspect;
  appointments: KanbanAppointment[];
  deals: KanbanDeal[];
  // derived on client
  column: KanbanColumn;
  daysSinceLastContact: number;
  nextAppointment: KanbanAppointment | null;
  latestMeetingType: MeetingType | null;
}

export const COLUMN_CONFIG: Record<
  KanbanColumn,
  { label: string; description: string; acceptsDrop: boolean }
> = {
  anstehend: {
    label: 'Anstehend',
    description: 'Termin geplant',
    acceptsDrop: true,
  },
  heute_fällig: {
    label: 'Heute Fällig',
    description: 'Meeting-Datum ist heute',
    acceptsDrop: false,
  },
  neu_terminieren: {
    label: 'Neu Terminieren',
    description: 'Vorheriger Termin geplatzt',
    acceptsDrop: true,
  },
  closed: {
    label: 'Geclosed',
    description: 'Gewonnener Deal',
    acceptsDrop: true,
  },
  rejected: {
    label: 'Abgelehnt',
    description: 'Verloren',
    acceptsDrop: true,
  },
};

export const COLUMN_ORDER: KanbanColumn[] = [
  'anstehend',
  'heute_fällig',
  'neu_terminieren',
  'closed',
  'rejected',
];

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  discovery: 'Discovery',
  demo: 'Demo',
  proposal: 'Proposal',
  closing: 'Closing',
  follow_up: 'Follow-Up',
  other: 'Sonstiges',
};

export const OUTCOME_LABELS: Record<MeetingOutcomeType, string> = {
  interested: 'Interessiert',
  not_interested: 'Kein Interesse',
  follow_up_needed: 'Follow-Up nötig',
  proposal_requested: 'Angebot gewünscht',
  closed_won: 'Gewonnen',
  closed_lost: 'Verloren',
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Neu',
  contacted: 'Kontaktiert',
  qualified: 'Qualifiziert',
  proposal: 'Angebot',
  negotiating: 'Verhandlung',
  won: 'Gewonnen',
  lost: 'Verloren',
};

export const RESCHEDULE_REASONS = [
  'Kurzfristig abgesagt',
  'Kein Show (No-Show)',
  'Termin verschoben',
  'Technische Probleme',
  'Interessent nicht erreichbar',
  'Sonstiges',
] as const;

export function getLeadDealValue(lead: KanbanLead): number {
  return lead.deals.reduce((sum, d) => sum + (d.value ?? 0), 0);
}

export function getInitials(firstName: string, lastName: string): string {
  const a = firstName.charAt(0).toUpperCase();
  const b = lastName.charAt(0).toUpperCase();
  return `${a}${b}`;
}

export function filterLeads(leads: KanbanLead[], f: FilterState): KanbanLead[] {
  return leads.filter((lead) => {
    if (f.search) {
      const q = f.search.toLowerCase();
      const name = `${lead.prospect.first_name} ${lead.prospect.last_name}`.toLowerCase();
      const company = (lead.prospect.company ?? '').toLowerCase();
      if (!name.includes(q) && !company.includes(q)) return false;
    }
    if (f.assignees.length > 0) {
      if (!lead.assigned_to || !f.assignees.includes(lead.assigned_to)) return false;
    }
    if (f.meetingTypes.length > 0) {
      if (!lead.latestMeetingType || !f.meetingTypes.includes(lead.latestMeetingType)) return false;
    }
    if (f.industries.length > 0) {
      if (!lead.prospect.industry || !f.industries.includes(lead.prospect.industry)) return false;
    }
    if (f.companySizes.length > 0) {
      if (!lead.prospect.company_size || !f.companySizes.includes(lead.prospect.company_size)) return false;
    }
    return true;
  });
}

/** Derives the Kanban column from lead + appointment data */
export function deriveKanbanColumn(
  status: LeadStatus,
  appointments: KanbanAppointment[]
): KanbanColumn {
  if (status === 'won') return 'closed';
  if (status === 'lost') return 'rejected';

  const sorted = [...appointments].sort(
    (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
  );
  const latest = sorted[0];
  if (!latest) return 'anstehend';

  const today = new Date();
  const apptDate = new Date(latest.scheduled_at);
  const isToday =
    apptDate.getFullYear() === today.getFullYear() &&
    apptDate.getMonth() === today.getMonth() &&
    apptDate.getDate() === today.getDate();

  if (latest.status === 'scheduled') {
    return isToday ? 'heute_fällig' : 'anstehend';
  }
  if (['rescheduled', 'no_show', 'cancelled'].includes(latest.status)) {
    return 'neu_terminieren';
  }
  return 'anstehend';
}

/** Days since the most recent appointment or lead creation */
export function calcDaysSinceLastContact(
  appointments: KanbanAppointment[],
  createdAt: string
): number {
  const sorted = [...appointments].sort(
    (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
  );
  const refDate = sorted[0]
    ? new Date(sorted[0].scheduled_at)
    : new Date(createdAt);
  const diff = Date.now() - refDate.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}
