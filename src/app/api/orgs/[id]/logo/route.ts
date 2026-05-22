import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_ORG_LOGOS ?? 'org-logos';
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from('profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single();

  const isSuperAdmin = profile?.role === 'super_admin';
  const isOrgAdmin   = profile?.role === 'org_admin' && profile?.organization_id === params.id;
  if (!isSuperAdmin && !isOrgAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 413 });

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${params.id}/logo.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

  const { error: dbError } = await admin
    .from('organizations')
    .update({ logo_url: url })
    .eq('id', params.id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ url });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from('profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single();

  const isSuperAdmin = profile?.role === 'super_admin';
  const isOrgAdmin   = profile?.role === 'org_admin' && profile?.organization_id === params.id;
  if (!isSuperAdmin && !isOrgAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Try to remove all common extensions
  await admin.storage.from(BUCKET).remove([
    `${params.id}/logo.jpg`,
    `${params.id}/logo.png`,
    `${params.id}/logo.webp`,
  ]);

  const { error: dbError } = await admin
    .from('organizations')
    .update({ logo_url: null })
    .eq('id', params.id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
