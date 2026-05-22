import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import type { UserRole } from '@/lib/types/database';

export async function POST(req: NextRequest) {
  // Validate caller is super_admin
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json() as { email: string; role: UserRole; organization_id: string };
  const { email, role, organization_id } = body;

  if (!email || !role || !organization_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Use service role to create / invite the user
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const { data: inviteData, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    {
      data:       { organization_id, role },
      redirectTo: `${appUrl}/auth/set-password`,
    }
  );

  if (inviteErr) {
    return NextResponse.json({ error: inviteErr.message }, { status: 400 });
  }

  // Upsert profile — the DB trigger may already create it on signup,
  // but we pre-create it here so the admin panel shows the user immediately.
  const { error: profileErr } = await adminClient
    .from('profiles')
    .upsert({
      id:              inviteData.user.id,
      organization_id,
      role,
      full_name:       null,
      avatar_url:      null,
    }, { onConflict: 'id' });

  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, user_id: inviteData.user.id });
}
