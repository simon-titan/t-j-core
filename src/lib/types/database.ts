// Auto-derivable from Migration 001 — T&J CRM Database Types

export type UserRole = 'super_admin' | 'org_admin' | 'member';

export type PitchStatus    = 'sent' | 'delivered' | 'answered' | 'ignored' | 'bounced';
export type FollowupStatus = 'pending' | 'sent' | 'skipped';
export type LeadStatus     = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiating' | 'won' | 'lost';
export type AppointmentStatus = 'scheduled' | 'completed' | 'rescheduled' | 'cancelled' | 'no_show';
export type MeetingOutcomeType = 'interested' | 'not_interested' | 'follow_up_needed' | 'proposal_requested' | 'closed_won' | 'closed_lost';
export type DealStage      = 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
export type NotificationType = 'followup_due' | 'appointment_due' | 'appointment_rescheduled' | 'lead_created' | 'deal_updated' | 'reschedule_needed';

export interface Organization {
  id:         string;
  name:       string;
  slug:       string;
  logo_url:   string | null;
  is_active:  boolean;
  settings:   { admin_visibility: 'all' | 'own' };
  created_at: string;
  updated_at: string;
}

export type PitchTrackerDefault = 'detailed' | 'light_auto' | 'light_manual';

export interface Profile {
  id:                    string;
  organization_id:       string;
  role:                  UserRole;
  full_name:             string | null;
  avatar_url:            string | null;
  pitch_tracker_default: PitchTrackerDefault;
  created_at:            string;
  updated_at:            string;
}

export interface PitchTrackerDailyStat {
  id:               string;
  organization_id:  string;
  user_id:          string;
  entry_date:       string;
  messages_sent:    number;
  followups_sent:   number;
  replies_received: number;
  appointments_set: number;
  closings:         number;
  notes:            string | null;
  created_at:       string;
  updated_at:       string;
}

export interface PitchTemplate {
  id:               string;
  organization_id:  string;
  created_by:       string | null;
  name:             string;
  subject:          string | null;
  body:             string;
  target_audience:  string | null;
  product_service:  string | null;
  is_active:        boolean;
  created_at:       string;
  updated_at:       string;
}

export interface VisibilityMatrix {
  id:         string;
  org_id:     string;
  viewer_id:  string;
  target_id:  string;
  created_at: string;
}

export interface Prospect {
  id:              string;
  organization_id: string;
  created_by:      string | null;
  linkedin_url:    string | null;
  first_name:      string;
  last_name:       string;
  company:         string | null;
  position:        string | null;
  email:           string | null;
  phone:           string | null;
  notes:           string | null;
  created_at:      string;
  updated_at:      string;
}

export interface Pitch {
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
}

export interface Followup {
  id:              string;
  pitch_id:        string;
  organization_id: string;
  assigned_to:     string | null;
  level:           1 | 2 | 3;
  status:          FollowupStatus;
  scheduled_for:   string | null;
  sent_at:         string | null;
  notes:           string | null;
  created_at:      string;
  updated_at:      string;
}

export interface Lead {
  id:              string;
  organization_id: string;
  prospect_id:     string;
  pitch_id:        string | null;
  assigned_to:     string | null;
  status:          LeadStatus;
  deal_value:      number | null;
  notes:           string | null;
  created_at:      string;
  updated_at:      string;
}

export interface Appointment {
  id:                    string;
  organization_id:       string;
  lead_id:               string;
  created_by:            string | null;
  assigned_to:           string | null;
  title:                 string;
  scheduled_at:          string;
  duration_minutes:      number;
  location:              string | null;
  status:                AppointmentStatus;
  previous_scheduled_at: string | null;
  notes:                 string | null;
  created_at:            string;
  updated_at:            string;
}

export interface MeetingOutcome {
  id:             string;
  appointment_id: string;
  organization_id:string;
  recorded_by:    string | null;
  outcome:        MeetingOutcomeType;
  summary:        string | null;
  next_steps:     string | null;
  created_at:     string;
  updated_at:     string;
}

export interface Deal {
  id:                  string;
  organization_id:     string;
  lead_id:             string;
  created_by:          string | null;
  assigned_to:         string | null;
  name:                string;
  value:               number | null;
  currency:            string;
  stage:               DealStage;
  probability:         number;
  expected_close_date: string | null;
  notes:               string | null;
  created_at:          string;
  updated_at:          string;
}

export interface Notification {
  id:              string;
  organization_id: string;
  user_id:         string;
  type:            NotificationType;
  reference_table: string | null;
  reference_id:    string | null;
  title:           string;
  body:            string | null;
  is_read:         boolean;
  created_at:      string;
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

export type OnboardingModuleType = 'workbook' | 'reference' | 'script';
export type OnboardingQuestionType = 'textarea' | 'text' | 'checkbox_group';
export type OnboardingVisibility = 'private' | 'team';
export type ScriptStepType = 'group_header' | 'step' | 'substep' | 'objection';
export type ScriptCallGroup = 'setting' | 'closing';

export interface OnboardingModule {
  id:          string;
  slug:        string;
  title:       string;
  description: string | null;
  icon:        string | null;
  order_index: number;
  type:        OnboardingModuleType;
  is_active:   boolean;
  created_at:  string;
}

export interface OnboardingSection {
  id:          string;
  module_id:   string;
  title:       string;
  description: string | null;
  order_index: number;
  created_at:  string;
}

export interface OnboardingQuestion {
  id:            string;
  section_id:    string;
  module_id:     string;
  question_text: string;
  helper_text:   string | null;
  type:          OnboardingQuestionType;
  options:       string[] | null;
  order_index:   number;
  is_required:   boolean;
  created_at:    string;
}

export interface OnboardingAnswer {
  id:          string;
  question_id: string;
  user_id:     string;
  org_id:      string;
  answer_text: string | null;
  answer_json: string[] | null;
  visibility:  OnboardingVisibility;
  created_at:  string;
  updated_at:  string;
}

export interface OnboardingAdminNote {
  id:             string;
  question_id:    string;
  target_user_id: string;
  admin_id:       string;
  org_id:         string;
  note_text:      string;
  created_at:     string;
  updated_at:     string;
}

export interface OnboardingExample {
  id:          string;
  module_slug: string;
  title:       string | null;
  content:     string;
  order_index: number;
  created_at:  string;
}

export interface UserPitchScript {
  id:          string;
  user_id:     string;
  org_id:      string;
  module_slug: string;
  content:     string;
  created_at:  string;
  updated_at:  string;
}

export interface ScriptTemplateStep {
  id:          string;
  module_slug: string;
  step_number: string;
  title:       string;
  step_type:   ScriptStepType;
  body:        string | null;
  bullets:     string[] | null;
  call_group:  ScriptCallGroup | null;
  order_index: number;
  created_at:  string;
  updated_at:  string;
}

type R = [];

// Supabase Database type for generic client
export type Database = {
  public: {
    Tables: {
      organizations:          { Row: Organization;        Insert: Partial<Organization>;        Update: Partial<Organization>;        Relationships: R };
      profiles:               { Row: Profile;             Insert: Partial<Profile>;             Update: Partial<Profile>;             Relationships: R };
      pitch_templates:        { Row: PitchTemplate;       Insert: Partial<PitchTemplate>;       Update: Partial<PitchTemplate>;       Relationships: R };
      prospects:              { Row: Prospect;            Insert: Partial<Prospect>;            Update: Partial<Prospect>;            Relationships: R };
      pitches:                { Row: Pitch;               Insert: Partial<Pitch>;               Update: Partial<Pitch>;               Relationships: R };
      followups:              { Row: Followup;            Insert: Partial<Followup>;            Update: Partial<Followup>;            Relationships: R };
      leads:                  { Row: Lead;                Insert: Partial<Lead>;                Update: Partial<Lead>;                Relationships: R };
      appointments:           { Row: Appointment;         Insert: Partial<Appointment>;         Update: Partial<Appointment>;         Relationships: R };
      meeting_outcomes:       { Row: MeetingOutcome;      Insert: Partial<MeetingOutcome>;      Update: Partial<MeetingOutcome>;      Relationships: R };
      deals:                  { Row: Deal;                Insert: Partial<Deal>;                Update: Partial<Deal>;                Relationships: R };
      notifications:          { Row: Notification;        Insert: Partial<Notification>;        Update: Partial<Notification>;        Relationships: R };
      visibility_matrix:      { Row: VisibilityMatrix;    Insert: Partial<VisibilityMatrix>;    Update: Partial<VisibilityMatrix>;    Relationships: R };
      onboarding_modules:     { Row: OnboardingModule;    Insert: Partial<OnboardingModule>;    Update: Partial<OnboardingModule>;    Relationships: R };
      onboarding_sections:    { Row: OnboardingSection;   Insert: Partial<OnboardingSection>;   Update: Partial<OnboardingSection>;   Relationships: R };
      onboarding_questions:   { Row: OnboardingQuestion;  Insert: Partial<OnboardingQuestion>;  Update: Partial<OnboardingQuestion>;  Relationships: R };
      onboarding_answers:     { Row: OnboardingAnswer;    Insert: Partial<OnboardingAnswer>;    Update: Partial<OnboardingAnswer>;    Relationships: R };
      onboarding_admin_notes: { Row: OnboardingAdminNote; Insert: Partial<OnboardingAdminNote>; Update: Partial<OnboardingAdminNote>; Relationships: R };
      onboarding_examples:    { Row: OnboardingExample;   Insert: Partial<OnboardingExample>;   Update: Partial<OnboardingExample>;   Relationships: R };
      user_pitch_scripts:     { Row: UserPitchScript;     Insert: Partial<UserPitchScript>;     Update: Partial<UserPitchScript>;     Relationships: R };
      script_template_steps:  { Row: ScriptTemplateStep;  Insert: Partial<ScriptTemplateStep>;  Update: Partial<ScriptTemplateStep>;  Relationships: R };
      pitch_tracker_daily_stats: { Row: PitchTrackerDailyStat; Insert: Partial<PitchTrackerDailyStat>; Update: Partial<PitchTrackerDailyStat>; Relationships: R };
    };
    Views:    { [_ in never]: never };
    Functions:{ [_ in never]: never };
    Enums:    { [_ in never]: never };
  };
};
