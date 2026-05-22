import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminModuleDetailClient } from './_components/AdminModuleDetailClient';
import type { OnboardingModule, OnboardingAnswer, Profile, Organization } from '@/lib/types/database';
import type { SectionWithQuestions, AdminNoteWithAdmin } from '@/app/(app)/app/onboarding/_components/types';

export const metadata: Metadata = { title: 'Admin — Modul-Ansicht' };

interface Props {
  params: { id: string; uid: string; slug: string };
}

export default async function AdminModuleDetailPage({ params }: Props) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // Fetch org, user profile, and module in parallel first
  const [orgRes, profileRes, moduleRes] = await Promise.all([
    supabase.from('organizations').select('id, name').eq('id', params.id).single(),
    supabase.from('profiles').select('id, full_name, role').eq('id', params.uid).eq('organization_id', params.id).single(),
    supabase.from('onboarding_modules').select('*').eq('slug', params.slug).single(),
  ]);

  if (!orgRes.data || !profileRes.data || !moduleRes.data) notFound();

  const org     = orgRes.data     as Pick<Organization, 'id' | 'name'>;
  const profile = profileRes.data as Pick<Profile, 'id' | 'full_name' | 'role'>;
  const module  = moduleRes.data  as OnboardingModule;

  // Fetch sections with questions
  const { data: sectionsData } = await supabase
    .from('onboarding_sections')
    .select('*, onboarding_questions(*)')
    .eq('module_id', module.id)
    .order('order_index');

  const sections = (sectionsData ?? []) as SectionWithQuestions[];

  // All question IDs in this module
  const questionIds = sections.flatMap(s =>
    s.onboarding_questions.map(q => q.id)
  );

  // Fetch answers + admin notes in parallel (only if there are questions)
  const [answersRes, notesRes] = questionIds.length > 0
    ? await Promise.all([
        supabase
          .from('onboarding_answers')
          .select('*')
          .eq('user_id', params.uid)
          .in('question_id', questionIds),
        supabase
          .from('onboarding_admin_notes')
          .select('*, admin:admin_id(full_name)')
          .eq('target_user_id', params.uid)
          .in('question_id', questionIds),
      ])
    : [{ data: [] }, { data: [] }];

  const answers    = (answersRes.data ?? []) as OnboardingAnswer[];
  const adminNotes = (notesRes.data   ?? []) as AdminNoteWithAdmin[];

  // Progress
  const answeredIds = new Set(answers.map(a => a.question_id));
  const totalQ      = questionIds.length;
  const answeredQ   = questionIds.filter(id => answeredIds.has(id)).length;

  return (
    <AdminModuleDetailClient
      org={org}
      targetUser={{ id: params.uid, full_name: profile.full_name, role: profile.role }}
      module={module}
      sections={sections}
      answers={answers}
      adminNotes={adminNotes}
      adminId={user.id}
      totalQuestions={totalQ}
      answeredQuestions={answeredQ}
    />
  );
}
