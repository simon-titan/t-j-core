export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types/database';

function getRoleHome(role: UserRole): string {
  if (role === 'super_admin') return '/admin';
  if (role === 'org_admin')   return '/dashboard';
  return '/app';
}

export default async function RootPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = ((profile as { role?: string } | null)?.role ?? 'member') as UserRole;
  redirect(getRoleHome(role));
}
