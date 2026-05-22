import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types/database';
import type { TemplateWithStats, OrgMember } from './_components/types';
import { PitchTrackerOverviewClient } from './_components/PitchTrackerOverviewClient';

export const metadata: Metadata = {
  title: 'Pitch Tracker',
};

export default async function PitchTrackerPage() {
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

  const [templatesRes, noTemplateRes, membersRes, followupsRes] = await Promise.all([
    // Templates + embedded pitch stats (incl. followup statuses) for the entire org
    supabase
      .from('pitch_templates')
      .select('id, name, body, is_active, created_by, target_audience, product_service, pitches(id, status, sent_at, sent_by, leads(id), followups(id, status))')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: true }),

    // Pitches without a template (org-wide)
    supabase
      .from('pitches')
      .select('id, status, sent_at, sent_by, leads(id)')
      .eq('organization_id', orgId)
      .is('template_id', null),

    // Org members for team performance section
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .eq('organization_id', orgId),

    // Current user's open follow-ups count
    supabase
      .from('followups')
      .select('id')
      .eq('assigned_to', user.id)
      .eq('status', 'pending'),
  ]);

  const templates         = (templatesRes.data   ?? []) as unknown as TemplateWithStats[];
  const noTemplatePitches = (noTemplateRes.data   ?? []) as Array<{ id: string; status: 'sent' | 'delivered' | 'answered' | 'ignored' | 'bounced'; sent_at: string; sent_by: string; leads: Array<{ id: string }> }>;
  const members           = (membersRes.data      ?? []) as OrgMember[];
  const openFollowups     = (followupsRes.data    ?? []).length;

  return (
    <PitchTrackerOverviewClient
      templates={templates}
      noTemplatePitches={noTemplatePitches}
      members={members}
      openFollowups={openFollowups}
      userId={user.id}
      orgId={orgId}
    />
  );
}
