'use client';

import { Box, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { OnboardingAnswer } from '@/lib/types/database';
import type { SectionWithQuestions, AdminNoteWithAdmin } from '../../_components/types';
import { QuestionItem } from './QuestionItem';

const MotionBox = motion(Box);

interface Props {
  section:     SectionWithQuestions;
  answersMap:  Map<string, OnboardingAnswer>;
  adminNotes:  AdminNoteWithAdmin[];
  onAnswer:    (questionId: string, value: string | string[], visibility: 'private' | 'team') => void;
  isReadOnly?: boolean;
  onNext?:     () => void;
  isLastSection: boolean;
}

const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const cardReveal = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.65, 0, 0.35, 1] } },
};

export function SectionPanel({
  section, answersMap, adminNotes, onAnswer, isReadOnly, onNext, isLastSection,
}: Props) {
  const questions = [...section.onboarding_questions].sort(
    (a, b) => a.order_index - b.order_index
  );

  const requiredAnswered = questions
    .filter((q) => q.is_required)
    .every((q) => {
      const ans = answersMap.get(q.id);
      if (!ans) return false;
      if (q.type === 'checkbox_group') return (ans.answer_json ?? []).length > 0;
      return (ans.answer_text ?? '').trim().length > 0;
    });

  return (
    <MotionBox
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
      pt="var(--space-8)"
    >
      {/* Section description as editorial pull-quote */}
      {section.description && (
        <Box
          bg="var(--frost)"
          borderLeft="3px solid var(--forest)"
          borderRadius="0 var(--radius-3) var(--radius-3) 0"
          px="var(--space-5)"
          py="var(--space-4)"
          mb="var(--space-7)"
        >
          <Text
            fontFamily="var(--font-display)"
            fontStyle="italic"
            fontSize="16px"
            color="rgba(14,14,12,0.80)"
            lineHeight={1.5}
            letterSpacing="-0.01em"
          >
            {section.description}
          </Text>
        </Box>
      )}

      {/* Question cards with numbered decoration */}
      <MotionBox
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        display="flex"
        flexDir="column"
        gap="var(--space-5)"
      >
        {questions.map((q, idx) => {
          const latestNote = adminNotes
            .filter((n) => n.question_id === q.id)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

          return (
            <MotionBox
              key={q.id}
              variants={cardReveal}
              position="relative"
              display="flex"
              gap="var(--space-4)"
              alignItems="flex-start"
            >
              {/* Decorative number */}
              <Box
                flexShrink={0}
                w={{ base: '40px', md: '56px' }}
                pt="2px"
                userSelect="none"
              >
                <Text
                  fontFamily="var(--font-display)"
                  fontStyle="italic"
                  fontSize={{ base: '36px', md: '48px' }}
                  lineHeight={1}
                  letterSpacing="-0.04em"
                  color="var(--ink)"
                  style={{ opacity: 0.07 }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </Text>
              </Box>

              {/* Question card */}
              <Box
                flex={1}
                bg="var(--frost)"
                border="1px solid var(--mist)"
                borderRadius="var(--radius-3)"
                p="var(--space-6)"
                style={{ boxShadow: 'var(--shadow-1)' }}
                transition="box-shadow 180ms var(--ease-default)"
                _hover={{ boxShadow: 'var(--shadow-2)' }}
              >
                <QuestionItem
                  question={q}
                  answer={answersMap.get(q.id)}
                  onChange={onAnswer}
                  isReadOnly={isReadOnly}
                  adminNote={latestNote}
                />
              </Box>
            </MotionBox>
          );
        })}
      </MotionBox>

      {/* Footer action */}
      {!isReadOnly && !isLastSection && (
        <Box
          mt="var(--space-8)"
          pt="var(--space-6)"
          borderTop="1px solid var(--mist)"
          display="flex"
          justifyContent="flex-end"
        >
          <Box
            as="button"
            onClick={requiredAnswered ? onNext : undefined}
            disabled={!requiredAnswered}
            display="inline-flex"
            alignItems="center"
            gap="var(--space-2)"
            bg={requiredAnswered ? 'var(--forest)' : 'var(--mist)'}
            color={requiredAnswered ? 'var(--paper)' : 'var(--mute)'}
            borderRadius="var(--radius-3)"
            fontFamily="var(--font-sans)"
            fontWeight={500}
            fontSize="14px"
            px="var(--space-6)"
            h="44px"
            cursor={requiredAnswered ? 'pointer' : 'not-allowed'}
            transition="all 150ms var(--ease-default)"
            style={requiredAnswered ? undefined : { opacity: 0.5 }}
            _hover={requiredAnswered ? { bg: 'var(--glow)' } : {}}
            _active={requiredAnswered ? { transform: 'scale(0.97)' } : {}}
          >
            Nächster Abschnitt
            <ChevronRight size={16} strokeWidth={1.5} />
          </Box>
        </Box>
      )}

      {!isReadOnly && isLastSection && (
        <Box
          mt="var(--space-8)"
          pt="var(--space-6)"
          borderTop="1px solid var(--mist)"
          display="flex"
          justifyContent="flex-end"
        >
          <Box
            display="inline-flex"
            alignItems="center"
            gap="6px"
            px="var(--space-5)"
            py="10px"
            borderRadius="var(--radius-3)"
            fontFamily="var(--font-sans)"
            fontSize="13px"
            color="var(--forest)"
            bg="rgba(74,124,92,0.08)"
            border="1px solid rgba(74,124,92,0.20)"
          >
            Letzte Section — Antworten werden automatisch gespeichert
          </Box>
        </Box>
      )}
    </MotionBox>
  );
}
