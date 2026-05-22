import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UserPreviewClient } from './_components/UserPreviewClient';
import type { Profile, Organization } from '@/lib/types/database';
import type { ModuleWithProgress, ModuleStatus } from '@/app/(app)/app/onboarding/_components/types';

export const metadata: Metadata = { title: 'Admin — Benutzer-Übersicht' };

interface Props {
  params: { id: string; uid: string };
}

export default async function UserPreviewPage({ params }: Props) {
  const supabase = createClient();

  const [
    orgRes, profileRes, pitchesRes, leadsRes,
    modulesRes, questionsRes, answersRes, membersRes, notesRes,
  ] = await Promise.all([
    supabase
      .from('organizations')
      .select('id, name')
      .eq('id', params.id)
      .single(),

    supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', params.uid)
      .eq('organization_id', params.id)
      .single(),

    supabase
      .from('pitches')
      .select(`
        id, status, sent_at, answered_at,
        prospects(first_name, last_name, company),
        pitch_templates(name)
      `)
      .eq('sent_by', params.uid)
      .order('sent_at', { ascending: false }),

    supabase
      .from('leads')
      .select(`
        id, status, deal_value, updated_at,
        prospects(first_name, last_name)
      `)
      .eq('assigned_to', params.uid)
      .order('updated_at', { ascending: false }),

    supabase
      .from('onboarding_modules')
      .select('*')
      .eq('is_active', true)
      .order('order_index'),

    supabase
      .from('onboarding_questions')
      .select('id, module_id, is_required'),

    supabase
      .from('onboarding_answers')
      .select('question_id')
      .eq('user_id', params.uid),

    supabase
      .from('profiles')
      .select('id, full_name')
      .eq('organization_id', params.id)
      .order('full_name'),

    supabase
      .from('onboarding_admin_notes')
      .select('question_id, onboarding_questions!inner(module_id)')
      .eq('target_user_id', params.uid)
      .eq('org_id', params.id),
  ]);

  if (!orgRes.data || !profileRes.data) notFound();

  const org     = orgRes.data     as Pick<Organization, 'id' | 'name'>;
  const profile = profileRes.data as Pick<Profile, 'id' | 'full_name' | 'role'>;

  // ── Onboarding progress per module ─────────────────────────
  const modules   = modulesRes.data   ?? [];
  const questions = questionsRes.data ?? [];
  const answers   = answersRes.data   ?? [];
  const members   = (membersRes.data  ?? []) as { id: string; full_name: string | null }[];

  const answeredIds = new Set(answers.map(a => a.question_id));

  // ── Note counts per module ──────────────────────────────────
  const noteCountsByModule: Record<string, number> = {};
  for (const note of (notesRes.data ?? []) as any[]) {
    const moduleId = note.onboarding_questions?.module_id;
    if (moduleId) noteCountsByModule[moduleId] = (noteCountsByModule[moduleId] ?? 0) + 1;
  }

  const modulesWithProgress: ModuleWithProgress[] = modules.map(mod => {
    const modQs   = questions.filter(q => q.module_id === mod.id);
    const total    = modQs.length;
    const answered = modQs.filter(q => answeredIds.has(q.id)).length;
    const pct      = total > 0 ? Math.round((answered / total) * 100) : 0;
    const hasUnreqAnswered = modQs.some(q => q.is_required && !answeredIds.has(q.id));

    let status: ModuleStatus = 'not_started';
    if (answered > 0 && answered < total) status = 'in_progress';
    if (total > 0 && answered === total)  status = 'completed';

    return {
      ...mod,
      totalQuestions:    total,
      answeredQuestions: answered,
      percentage:        pct,
      status,
      hasUnreqAnswered,
    } as ModuleWithProgress & { hasUnreqAnswered: boolean };
  });

  return (
    <UserPreviewClient
      orgId={org.id}
      orgName={org.name}
      uid={params.uid}
      userName={profile.full_name}
      userRole={profile.role}
      pitches={(pitchesRes.data ?? []) as any}
      leads={(leadsRes.data ?? []) as any}
      modules={modulesWithProgress}
      orgMembers={members}
      noteCountsByModule={noteCountsByModule}
    />
  );
}
