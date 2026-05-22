import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { UserRole } from '@/lib/types/database';

function getRoleHome(role: UserRole): string {
  if (role === 'super_admin') return '/admin';
  if (role === 'org_admin')   return '/dashboard';
  return '/app';
}

async function fetchRole(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
): Promise<UserRole> {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  return ((data as { role?: string } | null)?.role ?? 'member') as UserRole;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pure pass-through — no auth check needed
  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // ── Root "/" ─────────────────────────────────────────────────────────────
  // Always redirect — no content lives at root
  if (pathname === '/') {
    if (!user) return NextResponse.redirect(new URL('/login', request.url));
    const role = await fetchRole(supabase, user.id);
    return NextResponse.redirect(new URL(getRoleHome(role), request.url));
  }

  // ── Login page ────────────────────────────────────────────────────────────
  // Already authenticated → send to role home
  if (pathname.startsWith('/login')) {
    if (!user) return NextResponse.next();
    const role = await fetchRole(supabase, user.id);
    return NextResponse.redirect(new URL(getRoleHome(role), request.url));
  }

  // ── All other protected routes ────────────────────────────────────────────
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = await fetchRole(supabase, user.id);

  // RBAC guards
  if (pathname.startsWith('/admin') && role !== 'super_admin') {
    return NextResponse.redirect(new URL(getRoleHome(role), request.url));
  }
  if (pathname.startsWith('/dashboard') && role === 'member') {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  // Forward role + user id to layouts via header (avoids duplicate DB round-trips)
  response.headers.set('x-user-role', role);
  response.headers.set('x-user-id', user.id);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
