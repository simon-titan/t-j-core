import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types/database';

function getRoleHome(role: UserRole): string {
  if (role === 'super_admin') return '/admin';
  if (role === 'org_admin')   return '/dashboard';
  return '/app';
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type      = searchParams.get('type') as EmailOtpType | null;
  const code      = searchParams.get('code');
  const next      = searchParams.get('next');

  const supabase = createClient();
  let verified = false;

  if (tokenHash && type) {
    // Device-independent confirmation (email_change, recovery, signup, …).
    // Does not require the PKCE code verifier from the originating browser.
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    verified = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    verified = !error;
  }

  if (verified) {
    if (type === 'email_change') {
      return NextResponse.redirect(`${origin}/app/account?email_changed=1`);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = ((profileData as { role?: string } | null)?.role ?? 'member') as UserRole;
      return NextResponse.redirect(`${origin}${next ?? getRoleHome(role)}`);
    }
  }

  return NextResponse.redirect(`${origin}${next ?? '/login?error=auth'}`);
}
