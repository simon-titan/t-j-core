-- =============================================================================
-- Migration 20260522000004: Unique constraint für onboarding_answers upsert
-- =============================================================================

ALTER TABLE public.onboarding_answers
  ADD CONSTRAINT uq_onboarding_answers_question_user UNIQUE (question_id, user_id);
