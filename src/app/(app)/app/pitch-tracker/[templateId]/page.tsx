import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types/database';
import type { PitchWithRelations, PendingFollowup } from '../_components/types';
import { PitchTrackerDetailClient } from '../_components/PitchTrackerDetailClient';

export const metadata: Metadata = {
  title: 'Pitch Tracker — Template',
};

interface PageProps {
  params: { templateId: string };
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { templateId } = params;
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  const profile = profileData as Profile | null;
  if (!profile) redirect('/login');

  const orgId = profile.organization_id;

  const isNoTemplate = templateId === 'no-template';

  // Fetch template (unless no-template route)
  let template: { id: string; name: string; body: string; target_audience: string | null } | null = null;
  if (!isNoTemplate) {
    const { data } = await supabase
      .from('pitch_templates')
      .select('id, name, body, target_audience')
      .eq('id', templateId)
      .eq('organization_id', orgId)
      .single();

    if (!data) redirect('/app/pitch-tracker');
    template = data;
  }

  // Pitches for this template (all org members)
  const pitchesQuery = supabase
    .from('pitches')
    .select(`
      *,
      prospects(*),
      pitch_templates(name),
      followups(id, level, status, scheduled_for),
      leads(id, status, appointments(id, scheduled_at, status)),
      sender:profiles!sent_by(full_name)
    `)
    .eq('organization_id', orgId)
    .order('sent_at', { ascending: false });

  const [pitchesRes, followupsRes] = await Promise.all([
    isNoTemplate
      ? pitchesQuery.is('template_id', null)
      : pitchesQuery.eq('template_id', templateId),

    supabase
      .from('followups')
      .select(`
        *,
        pitches(
          id, sent_at,
          prospects(first_name, last_name),
          pitch_templates(name)
        )
      `)
      .eq('assigned_to', user.id)
      .eq('status', 'pending')
      .order('scheduled_for', { ascending: true }),
  ]);

  const pitches  = (pitchesRes.data  ?? []) as unknown as PitchWithRelations[];
  const followups = (followupsRes.data ?? []) as unknown as PendingFollowup[];

  return (
    <PitchTrackerDetailClient
      template={template}
      pitches={pitches}
      followups={followups}
      userId={user.id}
      orgId={orgId}
    />
  );
}
