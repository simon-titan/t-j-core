import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile, OnboardingAnswer } from '@/lib/types/database';
import type { SectionWithQuestions, AdminNoteWithAdmin, OrgMember } from '../_components/types';
import { ModuleDetailClient } from './_components/ModuleDetailClient';

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
  const [answersRes, adminNotesRes, orgMembersRes] = await Promise.all([
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
  ]);

  const initialAnswers  = (answersRes.data ?? [])   as OnboardingAnswer[];
  const adminNotes      = (adminNotesRes.data ?? []) as AdminNoteWithAdmin[];
  const orgMembers      = (orgMembersRes.data ?? []) as OrgMember[];

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
    />
  );
}
