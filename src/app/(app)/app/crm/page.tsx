import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types/database';
import {
  deriveKanbanColumn,
  calcDaysSinceLastContact,
} from './_components/types';
import type {
  KanbanLead,
  KanbanAppointment,
  KanbanProspect,
  KanbanDeal,
  MeetingType,
  OrgProfile,
} from './_components/types';
import { KanbanBoard } from './_components/KanbanBoard';

export const metadata: Metadata = { title: 'CRM Board' };

export default async function CrmPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  const profile = profileData as Profile | null;
  if (!profile) redirect('/login');

  const orgId = profile.organization_id;

  const { data: rawProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('organization_id', orgId);
  const profiles: OrgProfile[] = (rawProfiles ?? []).map((p: any) => ({
    id: p.id,
    full_name: p.full_name ?? null,
    avatar_url: p.avatar_url ?? null,
  }));

  const { data: rawLeads } = await supabase
    .from('leads')
    .select(
      `
      id, status, meeting_system, pain_points, objections, notes,
      created_at, updated_at, assigned_to, organization_id, prospect_id,
      prospects(
        id, first_name, last_name, company, position,
        email, phone, linkedin_url, website, industry, company_size
      ),
      appointments(
        id, title, scheduled_at, duration_minutes, location,
        status, meeting_type, previous_scheduled_at, notes,
        meeting_outcomes(id, outcome, summary, next_steps, created_at),
        meeting_notes(id, appointment_id, organization_id, created_by, note_type, content, created_at, updated_at)
      ),
      deals(id, name, value, currency, stage, probability, expected_close_date)
    `
    )
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  const leads: KanbanLead[] = (rawLeads ?? []).map((raw: any) => {
    const appointments: KanbanAppointment[] = (raw.appointments ?? []).map(
      (a: any) => ({
        ...a,
        meeting_outcomes: a.meeting_outcomes ?? [],
        meeting_notes: a.meeting_notes ?? [],
      })
    );

    const column = deriveKanbanColumn(raw.status, appointments);
    const daysSinceLastContact = calcDaysSinceLastContact(
      appointments,
      raw.created_at
    );

    const futureScheduled = appointments
      .filter((a) => a.status === 'scheduled')
      .sort(
        (a, b) =>
          new Date(a.scheduled_at).getTime() -
          new Date(b.scheduled_at).getTime()
      );
    const nextAppointment = futureScheduled[0] ?? null;

    const latestMeetingType =
      (appointments.sort(
        (a, b) =>
          new Date(b.scheduled_at).getTime() -
          new Date(a.scheduled_at).getTime()
      )[0]?.meeting_type as MeetingType | null) ?? null;

    return {
      id: raw.id,
      status: raw.status,
      meeting_system: raw.meeting_system ?? null,
      pain_points: raw.pain_points ?? null,
      objections: raw.objections ?? null,
      notes: raw.notes ?? null,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
      assigned_to: raw.assigned_to ?? null,
      organization_id: raw.organization_id,
      prospect_id: raw.prospect_id,
      prospect: raw.prospects as KanbanProspect,
      appointments,
      deals: (raw.deals ?? []) as KanbanDeal[],
      column,
      daysSinceLastContact,
      nextAppointment,
      latestMeetingType,
    };
  });

  return <KanbanBoard initialLeads={leads} profiles={profiles} userId={user.id} orgId={orgId} />;
}
