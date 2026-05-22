'use client';

import { useState, useCallback, useRef } from 'react';
import { Box, Text, Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { CheckCircle, Lock, CalendarCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { CheckInQuestionItem } from './CheckInQuestionItem';
import type { CheckInSection, CheckInQuestion, CheckInAnswer, CheckInSubmission } from './types';

const MotionBox = motion(Box);

const MONTH_NAMES = [
  'Januar','Februar','März','April','Mai','Juni',
  'Juli','August','September','Oktober','November','Dezember',
];

interface Props {
  sections:        CheckInSection[];
  questions:       CheckInQuestion[];
  answers:         CheckInAnswer[];
  isSubmitted:     boolean;
  periodYear:      number;
  periodMonth:     number;
  pastSubmissions: CheckInSubmission[];
  orgId:           string;
}

export function CheckInClient({
  sections,
  questions,
  answers,
  isSubmitted: initialSubmitted,
  periodYear,
  periodMonth,
  orgId,
}: Props) {
  const supabase = createClient();

  const initialMap: Record<string, string> = {};
  for (const a of answers) {
    initialMap[a.question_id] = a.answer_text ?? '';
  }

  const [values, setValues]         = useState<Record<string, string>>(initialMap);
  const [isLocked, setIsLocked]     = useState(initialSubmitted);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(initialSubmitted);
  const [savingId, setSavingId]     = useState<string | null>(null);
  const debounceMap                 = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const totalRequired  = questions.filter(q => q.is_required).length;
  const answeredCount  = questions.filter(q => q.is_required && values[q.id]?.trim()).length;
  const progress       = totalRequired > 0 ? Math.round((answeredCount / totalRequired) * 100) : 0;

  const handleChange = useCallback(async (questionId: string, value: string) => {
    setValues(prev => ({ ...prev, [questionId]: value }));

    if (debounceMap.current[questionId]) {
      clearTimeout(debounceMap.current[questionId]);
    }

    debounceMap.current[questionId] = setTimeout(async () => {
      setSavingId(questionId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('checkin_answers').upsert({
        question_id:  questionId,
        user_id:      user.id,
        org_id:       orgId,
        period_year:  periodYear,
        period_month: periodMonth,
        answer_text:  value,
        updated_at:   new Date().toISOString(),
      }, { onConflict: 'question_id,user_id,period_year,period_month' });

      setSavingId(null);
    }, 800);
  }, [supabase, orgId, periodYear, periodMonth]);

  const handleSubmit = async () => {
    if (isLocked || submitting) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }

    const { error } = await supabase.from('checkin_submissions').insert({
      user_id:      user.id,
      org_id:       orgId,
      period_year:  periodYear,
      period_month: periodMonth,
    });

    if (!error) {
      setIsLocked(true);
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  const monthName = MONTH_NAMES[periodMonth - 1];
  const canSubmit = answeredCount >= totalRequired && !isLocked;

  return (
    <Box>
      {/* ── Hero Band ─────────────────────────────────────────────────────── */}
      <Box
        bg="var(--forest-deep)"
        mx={{ base: '-20px', md: '-32px' }}
        mt={{ base: '-20px', md: '-32px' }}
        mb={10}
        px={{ base: 'var(--space-6)', md: 'var(--space-9)' }}
        pt={{ base: 'var(--space-8)', md: 'var(--space-10)' }}
        pb={{ base: 'var(--space-7)', md: 'var(--space-9)' }}
        position="relative"
        overflow="hidden"
      >
        {/* Radial glow */}
        <Box
          position="absolute"
          inset={0}
          style={{
            background:
              'radial-gradient(ellipse 55% 80% at 80% 50%, rgba(45,84,67,0.55) 0%, transparent 70%)',
          }}
        />
        {/* Chase Trail */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          h="1px"
          overflow="hidden"
          sx={{
            '&::after': {
              content:    '""',
              position:   'absolute',
              inset:      0,
              background: 'linear-gradient(90deg, transparent 0%, var(--leaf) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation:  'chase 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.4s both',
            },
          }}
        />

        <Box position="relative" zIndex={1} maxW="640px">
          <Box display="flex" alignItems="center" gap={3} mb={4}>
            <Box
              w="36px" h="36px"
              borderRadius="var(--radius-2)"
              bg="rgba(255,255,255,0.08)"
              border="1px solid rgba(255,255,255,0.12)"
              display="flex" alignItems="center" justifyContent="center"
            >
              <CalendarCheck size={18} strokeWidth={1.5} color="var(--leaf)" />
            </Box>
            <Text
              fontFamily="var(--font-mono)"
              fontSize="10px"
              fontWeight={500}
              letterSpacing="0.12em"
              textTransform="uppercase"
              color="rgba(255,255,255,0.45)"
            >
              Monatlicher Check-In
            </Text>
          </Box>

          <Text
            as="h1"
            fontFamily="var(--font-serif)"
            fontSize={{ base: '28px', md: '36px' }}
            fontWeight={700}
            fontStyle="italic"
            letterSpacing="-0.02em"
            color="var(--paper)"
            lineHeight={1.1}
            mb={2}
          >
            {monthName} {periodYear}
          </Text>

          {submitted ? (
            <Box display="flex" alignItems="center" gap={2} mt={4}>
              <CheckCircle size={16} strokeWidth={1.5} color="var(--leaf)" />
              <Text fontFamily="var(--font-sans)" fontSize="14px" color="rgba(255,255,255,0.65)">
                Eingereicht — gut gemacht!
              </Text>
            </Box>
          ) : (
            <>
              <Text
                fontFamily="var(--font-sans)"
                fontSize="14px"
                color="rgba(255,255,255,0.55)"
                mb={6}
              >
                {answeredCount} von {totalRequired} Fragen beantwortet
              </Text>

              {/* Progress bar */}
              <Box
                h="4px"
                bg="rgba(255,255,255,0.10)"
                borderRadius="var(--radius-full)"
                overflow="hidden"
                maxW="320px"
              >
                <MotionBox
                  h="100%"
                  borderRadius="var(--radius-full)"
                  style={{ background: 'var(--gradient-leaf-glow, var(--leaf))' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
                />
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* ── Lock Banner ───────────────────────────────────────────────────── */}
      {isLocked && (
        <Box
          bg="rgba(74,124,92,0.08)"
          border="1px solid rgba(74,124,92,0.20)"
          borderRadius="var(--radius-3)"
          px={5}
          py={4}
          mb={8}
          display="flex"
          alignItems="center"
          gap={3}
        >
          <Lock size={16} strokeWidth={1.5} color="var(--forest)" />
          <Text fontFamily="var(--font-sans)" fontSize="14px" color="var(--forest)">
            Du hast deinen Check-In für {monthName} {periodYear} bereits eingereicht.
            Deine Antworten sind gespeichert.
          </Text>
        </Box>
      )}

      {/* ── Sections & Questions ──────────────────────────────────────────── */}
      {sections.map((section, si) => {
        const sectionQs = questions
          .filter(q => q.section_id === section.id)
          .sort((a, b) => a.order_index - b.order_index);

        return (
          <MotionBox
            key={section.id}
            mb={10}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1], delay: si * 0.06 } as never}
          >
            {/* Section header */}
            <Box
              display="flex"
              alignItems="center"
              gap={3}
              mb={5}
              pb={3}
              borderBottom="1px solid var(--mist)"
            >
              <Box
                w="24px" h="24px"
                borderRadius="var(--radius-2)"
                bg="var(--forest)"
                display="flex" alignItems="center" justifyContent="center"
                flexShrink={0}
              >
                <Text
                  fontFamily="var(--font-mono)"
                  fontSize="10px"
                  fontWeight={700}
                  color="var(--paper)"
                >
                  {si + 1}
                </Text>
              </Box>
              <Text
                fontFamily="var(--font-sans)"
                fontSize="16px"
                fontWeight={600}
                letterSpacing="-0.01em"
                color="var(--ink)"
              >
                {section.title}
              </Text>
            </Box>

            {/* Questions */}
            <Box display="flex" flexDir="column" gap={7}>
              {sectionQs.map((q, qi) => (
                <Box key={q.id}>
                  <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                    <Text
                      fontFamily="var(--font-mono)"
                      fontSize="11px"
                      fontWeight={500}
                      color="var(--mute)"
                      mt="2px"
                      flexShrink={0}
                    >
                      {qi + 1}.
                    </Text>
                    <Box>
                      <Text
                        fontFamily="var(--font-sans)"
                        fontSize="14px"
                        fontWeight={500}
                        color="var(--ink)"
                        mb={q.helper_text ? 1 : 2}
                      >
                        {q.question_text}
                        {q.is_required && (
                          <Box as="span" color="var(--forest)" ml={1}>*</Box>
                        )}
                      </Text>
                      {q.helper_text && (
                        <Text
                          fontFamily="var(--font-sans)"
                          fontSize="12px"
                          color="var(--mute)"
                          mb={2}
                        >
                          {q.helper_text}
                        </Text>
                      )}
                    </Box>
                  </Box>

                  <Box pl={5}>
                    <CheckInQuestionItem
                      question={q}
                      value={values[q.id] ?? ''}
                      onChange={handleChange}
                      isLocked={isLocked}
                    />
                    {savingId === q.id && (
                      <Text
                        fontFamily="var(--font-mono)"
                        fontSize="10px"
                        color="var(--mute)"
                        mt={1}
                      >
                        Speichern…
                      </Text>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </MotionBox>
        );
      })}

      {/* ── Submit ────────────────────────────────────────────────────────── */}
      {!isLocked && (
        <Box
          position="sticky"
          bottom={0}
          bg="rgba(248,248,250,0.92)"
          backdropFilter="blur(12px)"
          borderTop="1px solid var(--mist)"
          mx={{ base: '-20px', md: '-32px' }}
          px={{ base: 'var(--space-6)', md: 'var(--space-9)' }}
          py={4}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={4}
        >
          <Text fontFamily="var(--font-mono)" fontSize="12px" color="var(--mute)">
            {answeredCount}/{totalRequired} Pflichtfragen beantwortet
          </Text>
          <Button
            onClick={handleSubmit}
            isLoading={submitting}
            isDisabled={!canSubmit}
            bg="var(--forest)"
            color="var(--paper)"
            fontFamily="var(--font-sans)"
            fontSize="14px"
            fontWeight={500}
            h="40px"
            px={6}
            borderRadius="var(--radius-3)"
            border="none"
            cursor={canSubmit ? 'pointer' : 'not-allowed'}
            opacity={canSubmit ? 1 : 0.5}
            _hover={{ bg: canSubmit ? 'var(--glow)' : 'var(--forest)' }}
            _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
          >
            Check-In einreichen
          </Button>
        </Box>
      )}
    </Box>
  );
}
