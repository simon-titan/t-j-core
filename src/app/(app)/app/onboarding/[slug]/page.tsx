import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile, OnboardingAnswer, OnboardingExample, UserPitchScript, ScriptTemplateStep } from '@/lib/types/database';
import type { SectionWithQuestions, AdminNoteWithAdmin, OrgMember } from '../_components/types';
import { ModuleDetailClient } from './_components/ModuleDetailClient';
import { ScriptModuleClient } from './_components/ScriptModuleClient';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: params.slug };
}

export default async function OnboardingModulePage({ params }: Props) {
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

  // Fetch module
  const { data: moduleData } = await supabase
    .from('onboarding_modules')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (!moduleData) notFound();

  // Fetch sections + questions
  const { data: sectionsData } = await supabase
    .from('onboarding_sections')
    .select('*, onboarding_questions(*)')
    .eq('module_id', moduleData.id)
    .order('order_index')
    .order('order_index', { referencedTable: 'onboarding_questions' });

  const sections = (sectionsData ?? []) as SectionWithQuestions[];

  const allQuestionIds = sections.flatMap((s) =>
    s.onboarding_questions.map((q) => q.id)
  );

  const isAdmin = profile.role === 'org_admin' || profile.role === 'super_admin';

  // Parallel fetches
  const [answersRes, adminNotesRes, orgMembersRes, examplesRes, pitchScriptRes] = await Promise.all([
    allQuestionIds.length > 0
      ? supabase
          .from('onboarding_answers')
          .select('*')
          .eq('user_id', user.id)
          .eq('org_id', profile.organization_id)
          .in('question_id', allQuestionIds)
      : Promise.resolve({ data: [] }),

    isAdmin && allQuestionIds.length > 0
      ? supabase
          .from('onboarding_admin_notes')
          .select('*, admin:admin_id(full_name)')
          .eq('org_id', profile.organization_id)
          .in('question_id', allQuestionIds)
      : Promise.resolve({ data: [] }),

    isAdmin
      ? supabase
          .from('profiles')
          .select('id, full_name')
          .eq('organization_id', profile.organization_id)
      : Promise.resolve({ data: [] }),

    supabase
      .from('onboarding_examples')
      .select('*')
      .eq('module_slug', params.slug)
      .order('order_index')
      .order('created_at'),

    supabase
      .from('user_pitch_scripts')
      .select('*')
      .eq('user_id', user.id)
      .eq('module_slug', params.slug)
      .maybeSingle(),
  ]);

  const initialAnswers  = (answersRes.data     ?? []) as OnboardingAnswer[];
  const adminNotes      = (adminNotesRes.data   ?? []) as AdminNoteWithAdmin[];
  const orgMembers      = (orgMembersRes.data   ?? []) as OrgMember[];
  const examples        = (examplesRes.data     ?? []) as OnboardingExample[];
  const initialPitch    = (pitchScriptRes.data  ?? null) as UserPitchScript | null;

  // ─── Script modules use a dedicated builder + editable T&J template ─────────
  if (moduleData.type === 'script') {
    const { data: templateData } = await supabase
      .from('script_template_steps')
      .select('*')
      .eq('module_slug', params.slug)
      .order('order_index');

    return (
      <ScriptModuleClient
        module={moduleData}
        sections={sections}
        initialAnswers={initialAnswers}
        templateSteps={(templateData ?? []) as ScriptTemplateStep[]}
        userId={user.id}
        orgId={profile.organization_id}
        isAdmin={isAdmin}
        initialCustomNotes={initialPitch?.content ?? ''}
      />
    );
  }

  return (
    <ModuleDetailClient
      module={moduleData}
      sections={sections}
      initialAnswers={initialAnswers}
      adminNotes={adminNotes}
      orgMembers={orgMembers}
      userId={user.id}
      orgId={profile.organization_id}
      isAdmin={isAdmin}
      examples={examples}
      initialPitch={initialPitch?.content ?? ''}
    />
  );
}
