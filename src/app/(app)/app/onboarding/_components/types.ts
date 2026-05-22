import type {
  OnboardingModule,
  OnboardingSection,
  OnboardingQuestion,
  OnboardingAnswer,
  OnboardingAdminNote,
} from '@/lib/types/database';

export type { OnboardingModule, OnboardingSection, OnboardingQuestion, OnboardingAnswer, OnboardingAdminNote };

export type ModuleStatus = 'not_started' | 'in_progress' | 'completed';

export interface SectionWithQuestions extends OnboardingSection {
  onboarding_questions: OnboardingQuestion[];
}

export interface ModuleWithProgress extends OnboardingModule {
  totalQuestions:    number;
  answeredQuestions: number;
  percentage:        number;
  status:            ModuleStatus;
}

export interface OrgMember {
  id:        string;
  full_name: string | null;
}

export interface AdminNoteWithAdmin extends OnboardingAdminNote {
  admin?: { full_name: string | null };
}
