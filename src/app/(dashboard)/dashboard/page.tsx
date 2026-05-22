import { Metadata } from 'next';
import { redirect }  from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type {
  RawPitch,
  RawDeal,
  RawProfile,
  RawTemplate,
  AnalyticsData,
  PitchSummary,
  DealSummary,
} from './_components/types';
import { AnalyticsDashboardClient } from './_components/AnalyticsDashboardClient';

export const metadata: Metadata = { title: 'Analytics Dashboard' };

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profileData || (profileData.role !== 'org_admin' && profileData.role !== 'super_admin')) {
    redirect('/app');
  }

  const orgId = profileData.organization_id;

  const [pitchesRes, dealsRes, profilesRes, templatesRes] = await Promise.all([
    supabase
      .from('pitches')
      .select('id, sent_by, status, sent_at, template_id, leads(id, appointments(id))')
      .eq('organization_id', orgId)
      .order('sent_at', { ascending: true }),

    supabase
      .from('deals')
      .select('id, assigned_to, stage, value, created_at')
      .eq('organization_id', orgId),

    supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .eq('organization_id', orgId)
      .eq('role', 'member'),

    supabase
      .from('pitch_templates')
      .select('id, name')
      .eq('organization_id', orgId)
      .eq('is_active', true),
  ]);

  const rawPitches   = (pitchesRes.data   ?? []) as unknown as RawPitch[];
  const rawDeals     = (dealsRes.data     ?? []) as unknown as RawDeal[];
  const rawProfiles  = (profilesRes.data  ?? []) as unknown as RawProfile[];
  const rawTemplates = (templatesRes.data ?? []) as unknown as RawTemplate[];

  const pitchSummaries: PitchSummary[] = rawPitches.map(p => ({
    sentBy:         p.sent_by,
    sentAt:         p.sent_at.slice(0, 10),
    status:         p.status,
    templateId:     p.template_id,
    hasAppointment: (p.leads?.[0]?.appointments?.length ?? 0) > 0,
  }));

  const dealSummaries: DealSummary[] = rawDeals.map(d => ({
    assignedTo: d.assigned_to,
    stage:      d.stage,
    value:      d.value ?? 0,
    createdAt:  d.created_at?.slice(0, 10) ?? '',
  }));

  const analyticsData: AnalyticsData = {
    pitchSummaries,
    dealSummaries,
    members:   rawProfiles.map(p => ({
      userId:    p.id,
      fullName:  p.full_name ?? 'Unbekannt',
      avatarUrl: p.avatar_url,
    })),
    templates: rawTemplates.map(t => ({
      templateId: t.id,
      name:       t.name,
    })),
  };

  return <AnalyticsDashboardClient data={analyticsData} />;
}
