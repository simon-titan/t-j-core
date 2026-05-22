export type TimeRange = '7d' | '30d' | '90d' | 'custom';

export interface MemberMetrics {
  userId:       string;
  fullName:     string;
  avatarUrl:    string | null;
  dms:          number;
  answered:     number;
  appointments: number;
  deals:        number;
  dealValue:    number;
  dailyDms:     DailyDmPoint[];
}

export interface TemplateMetrics {
  templateId:   string;
  name:         string;
  dms:          number;
  answered:     number;
  appointments: number;
  answerRate:   number;
  apptRate:     number;
}

export interface DailyDmPoint {
  date:  string; // "YYYY-MM-DD"
  count: number;
}

export interface AnalyticsTotals {
  dms:          number;
  answered:     number;
  appointments: number;
  deals:        number;
  dealValue:    number;
}

// Minimal pitch summary for client-side date-filtered re-aggregation
export interface PitchSummary {
  sentBy:         string;
  sentAt:         string; // "YYYY-MM-DD"
  status:         string;
  templateId:     string | null;
  hasAppointment: boolean;
}

// Minimal deal summary for client-side filtering
export interface DealSummary {
  assignedTo: string | null;
  stage:      string;
  value:      number;
  createdAt:  string; // "YYYY-MM-DD"
}

export interface AnalyticsData {
  // Raw summaries for date-filtered re-aggregation on the client
  pitchSummaries: PitchSummary[];
  dealSummaries:  DealSummary[];
  // Static lookups
  members:   { userId: string; fullName: string; avatarUrl: string | null }[];
  templates: { templateId: string; name: string }[];
}

// Raw pitch row returned from Supabase
export interface RawPitch {
  id:          string;
  sent_by:     string;
  status:      string;
  sent_at:     string;
  template_id: string | null;
  leads:       { id: string; appointments: { id: string }[] }[];
}

export interface RawDeal {
  id:          string;
  assigned_to: string | null;
  stage:       string;
  value:       number | null;
  created_at:  string;
}

export interface RawProfile {
  id:         string;
  full_name:  string | null;
  avatar_url: string | null;
  role:       string;
}

export interface RawTemplate {
  id:   string;
  name: string;
}
