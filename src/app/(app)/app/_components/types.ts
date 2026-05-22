export interface DashboardMetrics {
  dmsThisWeek: number;
  answerRate: number;
  followupsToday: number;
  appointmentsThisWeek: number;
  totalClosed: number;
}

export interface PitchSnapshotItem {
  id: string;
  sent_at: string;
  status: string;
  prospect: { first_name: string; last_name: string; company: string | null };
  followups: { level: number; status: string; scheduled_for: string | null }[];
}

export interface CrmSnapshotLead {
  id: string;
  column: 'heute_fällig' | 'neu_terminieren';
  prospect: { first_name: string; last_name: string; company: string | null };
  nextAppointmentAt: string | null;
}

export interface TeamMemberRow {
  userId: string;
  fullName: string;
  dms: number;
  answerRate: number;
  appointments: number;
  closed: number;
  isCurrentUser: boolean;
}

export type DashboardTimeRange = 'week' | 'month';

export interface DashboardNotification {
  id: string;
  type: string;
  reference_table: string | null;
  reference_id: string | null;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ModuleProgressItem {
  id: string;
  slug: string;
  title: string;
  icon: string | null;
  percentage: number;
  status: 'not_started' | 'in_progress' | 'completed';
}
