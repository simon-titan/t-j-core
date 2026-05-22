import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/AppShell';
import type { Profile, Organization, UserRole } from '@/lib/types/database';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const profile = profileData as Profile | null;

  if (profile?.role !== 'super_admin') redirect('/app');

  const { data: orgData } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.organization_id)
    .single();

  const org = orgData as Organization | null;

  return (
    <AppShell
      role={profile.role as UserRole}
      orgName={org?.name ?? 'T&J CRM'}
      userId={user.id}
      fullName={profile.full_name}
    >
      {children}
    </AppShell>
  );
}
