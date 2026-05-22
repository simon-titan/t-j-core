import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types/database';
import type { ModuleWithProgress, ModuleStatus } from './_components/types';
import { OnboardingOverviewClient } from './_components/OnboardingOverviewClient';

export const metadata: Metadata = { title: 'Onboarding' };

export default async function OnboardingPage() {
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

  const [modulesRes, questionsRes, answersRes] = await Promise.all([
    supabase
      .from('onboarding_modules')
      .select('*')
      .eq('is_active', true)
      .order('order_index'),
    supabase
      .from('onboarding_questions')
      .select('id, module_id'),
    supabase
      .from('onboarding_answers')
      .select('question_id')
      .eq('user_id', user.id),
  ]);

  const modules   = modulesRes.data   ?? [];
  const questions = questionsRes.data ?? [];
  const answers   = answersRes.data   ?? [];

  const answeredIds = new Set(answers.map((a) => a.question_id));

  const modulesWithProgress: ModuleWithProgress[] = modules.map((mod) => {
    const total    = questions.filter((q) => q.module_id === mod.id).length;
    const answered = questions.filter((q) => q.module_id === mod.id && answeredIds.has(q.id)).length;
    const pct      = total > 0 ? Math.round((answered / total) * 100) : 0;

    let status: ModuleStatus = 'not_started';
    if (answered > 0 && answered < total) status = 'in_progress';
    if (total > 0 && answered === total)  status = 'completed';

    return { ...mod, totalQuestions: total, answeredQuestions: answered, percentage: pct, status };
  });

  const totalQuestions = questions.length;
  const totalAnswered  = answeredIds.size;

  return (
    <OnboardingOverviewClient
      modules={modulesWithProgress}
      totalQuestions={totalQuestions}
      totalAnswered={totalAnswered}
    />
  );
}
