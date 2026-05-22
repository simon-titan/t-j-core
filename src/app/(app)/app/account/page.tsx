import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types/database';
import { AccountSettings } from './_components/AccountSettings';

export const metadata: Metadata = { title: 'Konto-Einstellungen' };

export default async function AccountPage() {
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

  return (
    <AccountSettings
      email={user.email ?? ''}
      fullName={profile.full_name ?? ''}
    />
  );
}
