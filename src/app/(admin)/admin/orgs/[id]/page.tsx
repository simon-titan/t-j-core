import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { OrgDetailClient } from './_components/OrgDetailClient';
import type { Organization, Profile, PitchTemplate, VisibilityMatrix } from '@/lib/types/database';

export const metadata: Metadata = { title: 'Admin — Organisation' };

interface Props {
  params: { id: string };
}

export default async function OrgDetailPage({ params }: Props) {
  const supabase      = createClient();
  const adminSupabase = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const [orgRes, profilesRes, templatesRes, matrixRes] = await Promise.all([
    supabase
      .from('organizations')
      .select('*')
      .eq('id', params.id)
      .single(),

    supabase
      .from('profiles')
      .select('*')
      .eq('organization_id', params.id)
      .order('created_at'),

    supabase
      .from('pitch_templates')
      .select('*')
      .eq('organization_id', params.id)
      .order('created_at'),

    supabase
      .from('visibility_matrix')
      .select('*')
      .eq('org_id', params.id),
  ]);

  if (!orgRes.data) notFound();

  const org       = orgRes.data      as Organization;
  const profiles  = (profilesRes.data  ?? []) as Profile[];
  const templates = (templatesRes.data ?? []) as PitchTemplate[];
  const matrix    = (matrixRes.data    ?? []) as VisibilityMatrix[];

  // Fetch emails via admin client (auth.users)
  let emailMap: Record<string, string> = {};
  try {
    const { data: authUsers } = await adminSupabase.auth.admin.listUsers({
      perPage: 1000,
    });
    if (authUsers?.users) {
      emailMap = Object.fromEntries(
        authUsers.users.map(u => [u.id, u.email ?? ''])
      );
    }
  } catch {
    // Service role key may not be configured — emails show as null
  }

  const members = profiles.map(p => ({
    ...p,
    email: emailMap[p.id] ?? null,
  }));

  return (
    <OrgDetailClient
      org={org}
      members={members}
      templates={templates}
      matrix={matrix}
      userId={user.id}
    />
  );
}
