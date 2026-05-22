import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OrgSettingsClient } from './_components/OrgSettingsClient';
import type { Organization, Profile } from '@/lib/types/database';

export const metadata: Metadata = { title: 'Einstellungen — T&J CRM' };

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const profile = profileData as Profile | null;
  if (!profile || profile.role === 'member') redirect('/app');

  const { data: orgData } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.organization_id)
    .single();

  const org = orgData as Organization | null;
  if (!org) redirect('/login');

  return <OrgSettingsClient org={org} />;
}
