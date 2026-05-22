import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import type { OnboardingExample } from '@/lib/types/database';
import { OnboardingExamplesClient } from './_components/OnboardingExamplesClient';

export const metadata: Metadata = { title: 'Admin — Onboarding Skripte' };

export default async function AdminOnboardingPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from('onboarding_examples')
    .select('*')
    .eq('module_slug', 'direct-pitch')
    .order('order_index')
    .order('created_at');

  const examples = (data ?? []) as OnboardingExample[];

  return <OnboardingExamplesClient initialExamples={examples} />;
}
