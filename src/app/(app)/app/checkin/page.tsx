import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types/database';
import { CheckInClient } from './_components/CheckInClient';
import type { CheckInSection, CheckInQuestion, CheckInAnswer, CheckInSubmission } from './_components/types';

export const metadata: Metadata = { title: 'Monatlicher Check-In' };

export default async function CheckInPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profileData } = await supabase
    .from('profiles')
    .select('id, organization_id, role')
    .eq('id', user.id)
    .single();
  const profile = profileData as Profile | null;
  if (!profile?.organization_id) redirect('/app');

  const now        = new Date();
  const periodYear = now.getFullYear();
  const periodMonth = now.getMonth() + 1;

  const [sectionsRes, questionsRes, answersRes, submissionRes] = await Promise.all([
    supabase
      .from('checkin_sections')
      .select('id, title, order_index')
      .order('order_index'),
    supabase
      .from('checkin_questions')
      .select('id, section_id, question_text, helper_text, type, options, order_index, is_required')
      .order('order_index'),
    supabase
      .from('checkin_answers')
      .select('question_id, answer_text, answer_json')
      .eq('user_id', user.id)
      .eq('period_year', periodYear)
      .eq('period_month', periodMonth),
    supabase
      .from('checkin_submissions')
      .select('id, period_year, period_month, submitted_at')
      .eq('user_id', user.id)
      .eq('period_year', periodYear)
      .eq('period_month', periodMonth)
      .maybeSingle(),
  ]);

  const sections   = (sectionsRes.data   ?? []) as CheckInSection[];
  const questions  = (questionsRes.data  ?? []) as CheckInQuestion[];
  const answers    = (answersRes.data    ?? []) as CheckInAnswer[];
  const submission = submissionRes.data as CheckInSubmission | null;

  return (
    <CheckInClient
      sections={sections}
      questions={questions}
      answers={answers}
      isSubmitted={!!submission}
      periodYear={periodYear}
      periodMonth={periodMonth}
      pastSubmissions={[]}
      orgId={profile.organization_id}
    />
  );
}
