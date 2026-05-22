'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Text, HStack, VStack } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { OnboardingModule, OnboardingAnswer, OnboardingExample } from '@/lib/types/database';
import type {
  SectionWithQuestions, AdminNoteWithAdmin, OrgMember,
} from '../../_components/types';
import { SectionPanel } from './SectionPanel';
import { SaveIndicator } from './SaveIndicator';
import { AdminPanel } from './AdminPanel';

const MotionBox = motion(Box);

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface Props {
  module:         OnboardingModule;
  sections:       SectionWithQuestions[];
  initialAnswers: OnboardingAnswer[];
  adminNotes:     AdminNoteWithAdmin[];
  orgMembers:     OrgMember[];
  userId:         string;
  orgId:          string;
  isAdmin:        boolean;
  examples:       OnboardingExample[];
}

export function ModuleDetailClient({
  module, sections, initialAnswers, adminNotes: initialAdminNotes,
  orgMembers, userId, orgId, isAdmin, examples,
}: Props) {
  const router   = useRouter();
  const supabase = createClient();

  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.order_index - b.order_index),
    [sections]
  );

  const [answersMap, setAnswersMap] = useState<Map<string, OnboardingAnswer>>(() => {
    const m = new Map<string, OnboardingAnswer>();
    initialAnswers.forEach((a) => m.set(a.question_id, a));
    return m;
  });

  const [saveState, setSaveState]           = useState<SaveState>('idle');
  const [activeTab, setActiveTab]           = useState(0);
  const [adminNotes, setAdminNotes]         = useState<AdminNoteWithAdmin[]>(initialAdminNotes);
  const [isViewingOther, setIsViewingOther] = useState(false);
  const [otherAnswersMap, setOtherAnswersMap] = useState<Map<string, OnboardingAnswer>>(new Map());

  const saveTimers    = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const saveStateTimer = useRef<ReturnType<typeof setTimeout>>();

  const allQuestions = useMemo(
    () => sortedSections.flatMap((s) => s.onboarding_questions),
    [sortedSections]
  );

  const answeredCount = useMemo(
    () => allQuestions.filter((q) => {
      const ans = answersMap.get(q.id);
      if (!ans) return false;
      if (q.type === 'checkbox_group') return (ans.answer_json ?? []).length > 0;
      return (ans.answer_text ?? '').trim().length > 0;
    }).length,
    [allQuestions, answersMap]
  );

  const progressPct = allQuestions.length > 0
    ? Math.round((answeredCount / allQuestions.length) * 100)
    : 0;

  const isCompleted = progressPct === 100;

  const handleAnswerChange = useCallback((
    questionId: string,
    value: string | string[],
    visibility: 'private' | 'team'
  ) => {
    setAnswersMap((prev) => {
      const next = new Map(prev);
      const existing = prev.get(questionId);
      next.set(questionId, {
        ...(existing ?? {
          id:          '',
          question_id: questionId,
          user_id:     userId,
          org_id:      orgId,
          created_at:  new Date().toISOString(),
          updated_at:  new Date().toISOString(),
        }),
        answer_text: Array.isArray(value) ? null : value,
        answer_json: Array.isArray(value) ? value : null,
        visibility,
        updated_at:  new Date().toISOString(),
      } as OnboardingAnswer);
      return next;
    });

    setSaveState('saving');
    clearTimeout(saveStateTimer.current);

    const existing = saveTimers.current.get(questionId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('onboarding_answers')
          .upsert(
            {
              question_id: questionId,
              user_id:     userId,
              org_id:      orgId,
              answer_text: Array.isArray(value) ? null : value || null,
              answer_json: Array.isArray(value) ? value : null,
              visibility,
              updated_at:  new Date().toISOString(),
            },
            { onConflict: 'question_id,user_id' }
          );

        if (error) throw error;

        setSaveState('saved');
        saveStateTimer.current = setTimeout(() => setSaveState('idle'), 2000);
      } catch {
        setSaveState('error');
        saveStateTimer.current = setTimeout(() => setSaveState('idle'), 3000);
      }
    }, 1000);

    saveTimers.current.set(questionId, timer);
  }, [userId, orgId, supabase]);

  function handleViewingUserChange(uid: string, map: Map<string, OnboardingAnswer>) {
    setIsViewingOther(uid !== userId);
    setOtherAnswersMap(map);
  }

  function handleNoteAdded(note: AdminNoteWithAdmin) {
    setAdminNotes((prev) => [note, ...prev]);
  }

  const displayAnswersMap = isViewingOther ? otherAnswersMap : answersMap;

  return (
    <Box>
      {/* Save indicator */}
      <SaveIndicator state={saveState} />

      {/* ─── DARK HERO ─────────────────────────────────────────────────────── */}
      <Box
        bg="var(--forest-deep)"
        position="relative"
        overflow="hidden"
        mx={{ base: '-20px', md: '-32px' }}
        mt={{ base: '-20px', md: '-32px' }}
        px={{ base: 'var(--space-6)', md: 'var(--space-9)' }}
        pt={{ base: 'var(--space-6)', md: 'var(--space-7)' }}
        pb={{ base: 'var(--space-7)', md: 'var(--space-8)' }}
      >
        {/* Background texture */}
        <Box
          position="absolute"
          inset={0}
          pointerEvents="none"
          style={{
            background: 'radial-gradient(ellipse 70% 100% at 90% 50%, rgba(45,84,67,0.40) 0%, transparent 65%)',
          }}
        />

        <Box position="relative">
          {/* Back navigation */}
          <Box
            as="button"
            onClick={() => router.push('/app/onboarding')}
            display="inline-flex"
            alignItems="center"
            gap="6px"
            fontFamily="var(--font-sans)"
            fontSize="12px"
            color="rgba(252,252,253,0.60)"
            bg="transparent"
            border="none"
            cursor="pointer"
            mb="var(--space-6)"
            transition="color 120ms"
            _hover={{ color: 'var(--leaf)' }}
          >
            <ArrowLeft size={13} strokeWidth={1.5} />
            Alle Module
          </Box>

          {/* Type kicker */}
          <MotionBox
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.65, 0, 0.35, 1] }}
          >
            <Text
              fontFamily="var(--font-mono)"
              fontSize="10px"
              fontWeight={500}
              letterSpacing="0.14em"
              textTransform="uppercase"
              color="var(--leaf)"
              mb="var(--space-4)"
            >
              — {module.type === 'workbook' ? 'Workbook' : 'Reference'}
            </Text>
          </MotionBox>

          {/* Title */}
          <MotionBox
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1], delay: 0.05 }}
            mb={module.description ? 'var(--space-4)' : 'var(--space-6)'}
          >
            <Text
              as="h1"
              fontFamily="var(--font-display)"
              fontStyle="italic"
              fontSize="clamp(28px, 4vw, 52px)"
              lineHeight={1.05}
              letterSpacing="-0.03em"
              color="var(--paper)"
            >
              {module.title}
            </Text>
          </MotionBox>

          {/* Description */}
          {module.description && (
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.12 }}
              mb="var(--space-6)"
            >
              <Text
                fontFamily="var(--font-sans)"
                fontSize="15px"
                color="rgba(252,252,253,0.72)"
                lineHeight={1.6}
                maxW="640px"
              >
                {module.description}
              </Text>
            </MotionBox>
          )}

          {/* Progress row */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.18 }}
          >
            <HStack gap="var(--space-4)" align="center" mb="var(--space-3)">
              <Box flex={1} h="2px" bg="rgba(252,252,253,0.10)" borderRadius="var(--radius-full)" overflow="hidden">
                <MotionBox
                  h="100%"
                  borderRadius="var(--radius-full)"
                  style={{ background: isCompleted ? 'var(--leaf)' : 'var(--gradient-leaf-glow)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1], delay: 0.25 }}
                />
              </Box>
              <HStack gap="var(--space-2)" flexShrink={0} align="center">
                {isCompleted && <CheckCircle2 size={13} strokeWidth={2} color="var(--leaf)" />}
                <Text fontFamily="var(--font-sans)" fontSize="12px" color="rgba(252,252,253,0.65)">
                  {answeredCount}/{allQuestions.length} beantwortet
                </Text>
              </HStack>
            </HStack>
          </MotionBox>
        </Box>

        {/* Chase Trail */}
        <Box position="absolute" bottom={0} left={0} right={0} h="1px" overflow="hidden">
          <MotionBox
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, var(--leaf) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
            }}
            initial={{ backgroundPosition: '200% 0' }}
            animate={{ backgroundPosition: '-200% 0' }}
            transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.4 }}
          />
        </Box>
      </Box>

      {/* ─── STICKY PILL TABS ─────────────────────────────────────────────── */}
      <Box
        position="sticky"
        top="var(--nav-height)"
        zIndex={20}
        bg="rgba(252,252,253,0.88)"
        borderBottom="1px solid var(--mist)"
        mx={{ base: '-20px', md: '-32px' }}
        style={{ backdropFilter: 'blur(12px) saturate(1.4)' }}
      >
        <Box
          px={{ base: '20px', md: '32px' }}
          pr={isAdmin ? { base: '20px', md: '300px' } : undefined}
        >
          <HStack
            gap="var(--space-2)"
            py="var(--space-3)"
            overflowX="auto"
            sx={{ '::-webkit-scrollbar': { display: 'none' } }}
          >
            {sortedSections.map((s, i) => (
              <Box
                key={s.id}
                as="button"
                onClick={() => setActiveTab(i)}
                px="var(--space-4)"
                py="var(--space-2)"
                borderRadius="var(--radius-full)"
                fontFamily="var(--font-sans)"
                fontSize="13px"
                fontWeight={activeTab === i ? 500 : 400}
                cursor="pointer"
                flexShrink={0}
                transition="all 140ms var(--ease-default)"
                border="1px solid"
                style={
                  activeTab === i
                    ? {
                        background: 'var(--forest)',
                        color: 'var(--paper)',
                        borderColor: 'var(--forest)',
                        boxShadow: 'var(--shadow-1)',
                      }
                    : {
                        background: 'transparent',
                        color: 'var(--mute)',
                        borderColor: 'transparent',
                      }
                }
                _hover={activeTab === i ? {} : { color: 'var(--ink)', borderColor: 'var(--mist)' }}
              >
                {s.title}
              </Box>
            ))}
          </HStack>
        </Box>
      </Box>

      {/* ─── CONTENT AREA ─────────────────────────────────────────────────── */}
      <Box
        pb="var(--space-10)"
        pr={isAdmin ? { base: '0', md: '300px' } : undefined}
      >
        <AnimatePresence mode="wait">
          {sortedSections[activeTab] && (
            <MotionBox
              key={sortedSections[activeTab].id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.65, 0, 0.35, 1] }}
            >
              <SectionPanel
                section={sortedSections[activeTab]}
                answersMap={displayAnswersMap}
                adminNotes={adminNotes.filter((n) =>
                  isViewingOther
                    ? n.target_user_id !== userId
                    : n.target_user_id === userId
                )}
                onAnswer={handleAnswerChange}
                isReadOnly={isViewingOther}
                onNext={() => setActiveTab(activeTab + 1)}
                isLastSection={activeTab === sortedSections.length - 1}
              />
            </MotionBox>
          )}
        </AnimatePresence>

        {/* ─── BEISPIELSKRIPTE VON T&J ──────────────────────────────────── */}
        {examples.length > 0 && (
          <Box mt="var(--space-10)" pt="var(--space-8)" borderTop="1px solid var(--mist)">
            <Text
              fontFamily="var(--font-mono)"
              fontSize="10px"
              fontWeight={500}
              letterSpacing="0.14em"
              textTransform="uppercase"
              color="var(--leaf)"
              mb="var(--space-4)"
            >
              — Beispielskripte von T&J
            </Text>
            <Text
              fontFamily="var(--font-display)"
              fontStyle="italic"
              fontSize="clamp(22px,3vw,32px)"
              letterSpacing="-0.03em"
              lineHeight={1.1}
              color="var(--ink)"
              mb="var(--space-6)"
            >
              Inspiration für deinen Direct Pitch
            </Text>
            <VStack spacing={4} align="stretch">
              {examples.map((ex) => (
                <Box
                  key={ex.id}
                  bg="var(--paper)"
                  border="1px solid var(--mist)"
                  borderRadius="var(--radius-3)"
                  p={5}
                >
                  {ex.title && (
                    <Text
                      fontFamily="var(--font-sans)"
                      fontSize="14px"
                      fontWeight={600}
                      letterSpacing="-0.01em"
                      color="var(--ink)"
                      mb={3}
                    >
                      {ex.title}
                    </Text>
                  )}
                  <Text
                    fontFamily="var(--font-sans)"
                    fontSize="14px"
                    color="var(--ink)"
                    lineHeight={1.75}
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {ex.content}
                  </Text>
                </Box>
              ))}
            </VStack>
          </Box>
        )}
      </Box>

      {/* Admin Panel */}
      {isAdmin && (
        <AdminPanel
          sections={sortedSections}
          adminNotes={adminNotes}
          orgMembers={orgMembers}
          currentUserId={userId}
          orgId={orgId}
          onViewingUserChange={handleViewingUserChange}
          onNoteAdded={handleNoteAdded}
        />
      )}
    </Box>
  );
}
