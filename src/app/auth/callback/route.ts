import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types/database';

function getRoleHome(role: UserRole): string {
  if (role === 'super_admin') return '/admin';
  if (role === 'org_admin')   return '/dashboard';
  return '/app';
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/app';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const role = ((profileData as { role?: string } | null)?.role ?? 'member') as UserRole;
        return NextResponse.redirect(`${origin}${getRoleHome(role)}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
