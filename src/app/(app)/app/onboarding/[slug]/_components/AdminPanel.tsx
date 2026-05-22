'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Text, Select, HStack, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Eye, CheckCircle2, Circle, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { OnboardingQuestion, OnboardingAnswer } from '@/lib/types/database';
import type { OrgMember, AdminNoteWithAdmin, SectionWithQuestions } from '../../_components/types';
import { AdminNoteModal } from './AdminNoteModal';

const MotionBox = motion(Box);

interface Props {
  sections:      SectionWithQuestions[];
  adminNotes:    AdminNoteWithAdmin[];
  orgMembers:    OrgMember[];
  currentUserId: string;
  orgId:         string;
  onViewingUserChange: (userId: string, answersMap: Map<string, OnboardingAnswer>) => void;
  onNoteAdded: (note: AdminNoteWithAdmin) => void;
}

export function AdminPanel({
  sections, adminNotes, orgMembers, currentUserId, orgId,
  onViewingUserChange, onNoteAdded,
}: Props) {
  const allQuestions: OnboardingQuestion[] = sections.flatMap((s) =>
    [...s.onboarding_questions].sort((a, b) => a.order_index - b.order_index)
  );

  const [viewingUserId, setViewingUserId] = useState(currentUserId);
  const [viewingAnswers, setViewingAnswers] = useState<Map<string, OnboardingAnswer>>(new Map());
  const [noteModal, setNoteModal] = useState<OnboardingQuestion | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const fetchUserAnswers = useCallback(async (userId: string) => {
    setLoadingUser(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('onboarding_answers')
      .select('*')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .in('question_id', allQuestions.map((q) => q.id));

    const map = new Map<string, OnboardingAnswer>();
    (data ?? []).forEach((a) => map.set(a.question_id, a as OnboardingAnswer));
    setViewingAnswers(map);
    setLoadingUser(false);
    onViewingUserChange(userId, map);
  }, [orgId, allQuestions, onViewingUserChange]);

  useEffect(() => {
    if (viewingUserId !== currentUserId) {
      fetchUserAnswers(viewingUserId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingUserId]);

  async function handleUserChange(userId: string) {
    setViewingUserId(userId);
    if (userId === currentUserId) {
      setViewingAnswers(new Map());
      onViewingUserChange(currentUserId, new Map());
    }
  }

  function getLatestNote(questionId: string, userId: string) {
    return adminNotes
      .filter((n) => n.question_id === questionId && n.target_user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  }

  function isAnswered(questionId: string) {
    const answersToCheck = viewingUserId !== currentUserId ? viewingAnswers : new Map();
    const ans = answersToCheck.get(questionId);
    if (!ans) return false;
    const q = allQuestions.find((q) => q.id === questionId);
    if (!q) return false;
    if (q.type === 'checkbox_group') return (ans.answer_json ?? []).length > 0;
    return (ans.answer_text ?? '').trim().length > 0;
  }

  const unansweredCount = viewingUserId !== currentUserId
    ? allQuestions.filter((q) => !isAnswered(q.id)).length
    : 0;

  return (
    <>
      <MotionBox
        initial={{ x: 280, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
        position="fixed"
        right="20px"
        top="calc(var(--nav-height) + 20px)"
        w="272px"
        maxH="calc(100vh - var(--nav-height) - 40px)"
        bg="var(--forest-deep)"
        border="1px solid rgba(252,252,253,0.08)"
        borderRadius="var(--radius-4)"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}
        overflow="hidden"
        display="flex"
        flexDir="column"
        zIndex={50}
      >
        {/* Header */}
        <Box
          px="var(--space-5)"
          py="var(--space-4)"
          borderBottom="1px solid rgba(252,252,253,0.08)"
          flexShrink={0}
        >
          <HStack gap="var(--space-3)">
            <Eye size={15} strokeWidth={1.5} color="var(--leaf)" />
            <Text
              fontFamily="var(--font-mono)"
              fontSize="10px"
              fontWeight={500}
              letterSpacing="0.12em"
              textTransform="uppercase"
              color="rgba(252,252,253,0.60)"
            >
              Admin-Ansicht
            </Text>
          </HStack>
        </Box>

        {/* User selector */}
        <Box
          px="var(--space-5)"
          py="var(--space-4)"
          borderBottom="1px solid rgba(252,252,253,0.08)"
          flexShrink={0}
        >
          <Text
            fontFamily="var(--font-mono)"
            fontSize="10px"
            fontWeight={500}
            color="rgba(252,252,253,0.35)"
            letterSpacing="0.10em"
            textTransform="uppercase"
            mb="var(--space-2)"
          >
            Mitglied
          </Text>
          <Select
            value={viewingUserId}
            onChange={(e) => handleUserChange(e.target.value)}
            size="sm"
            bg="rgba(252,252,253,0.06)"
            border="1px solid rgba(252,252,253,0.12)"
            borderRadius="var(--radius-2)"
            fontFamily="var(--font-sans)"
            fontSize="13px"
            color="var(--paper)"
            _focus={{ borderColor: 'var(--leaf)', boxShadow: '0 0 0 3px rgba(74,124,92,0.20)' }}
            sx={{
              option: { background: 'var(--forest-deep)', color: 'var(--paper)' },
            }}
          >
            {orgMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name ?? m.id.slice(0, 8)}
                {m.id === currentUserId ? ' (Du)' : ''}
              </option>
            ))}
          </Select>

          {viewingUserId !== currentUserId && !loadingUser && (
            <HStack mt="var(--space-2)" gap="var(--space-2)">
              <Box
                w="6px"
                h="6px"
                borderRadius="var(--radius-full)"
                bg={unansweredCount > 0 ? 'rgba(239,68,68,0.70)' : 'var(--leaf)'}
                flexShrink={0}
              />
              <Text
                fontFamily="var(--font-sans)"
                fontSize="11px"
                color="rgba(252,252,253,0.40)"
              >
                {unansweredCount > 0
                  ? `${unansweredCount} Fragen offen`
                  : 'Alle Fragen beantwortet'}
              </Text>
            </HStack>
          )}
        </Box>

        {/* Question list */}
        <Box overflowY="auto" flex={1} px="var(--space-3)" py="var(--space-3)">
          {viewingUserId === currentUserId ? (
            <Box
              textAlign="center"
              py="var(--space-7)"
              px="var(--space-4)"
            >
              <Eye size={20} strokeWidth={1.5} color="rgba(252,252,253,0.15)" />
              <Text
                fontFamily="var(--font-sans)"
                fontSize="12px"
                color="rgba(252,252,253,0.30)"
                mt="var(--space-3)"
                lineHeight={1.5}
              >
                Wähle ein Mitglied, um dessen Fortschritt zu sehen.
              </Text>
            </Box>
          ) : loadingUser ? (
            <Box textAlign="center" py="var(--space-7)">
              <Text
                fontFamily="var(--font-sans)"
                fontSize="12px"
                color="rgba(252,252,253,0.30)"
              >
                Lade…
              </Text>
            </Box>
          ) : (
            <VStack align="stretch" gap="2px">
              {allQuestions.map((q) => {
                const answered = isAnswered(q.id);
                const note     = getLatestNote(q.id, viewingUserId);

                return (
                  <Box
                    key={q.id}
                    px="var(--space-3)"
                    py="var(--space-3)"
                    borderRadius="var(--radius-2)"
                    border="1px solid"
                    borderColor={answered ? 'transparent' : 'rgba(239,68,68,0.15)'}
                    bg={answered ? 'rgba(252,252,253,0.03)' : 'rgba(239,68,68,0.05)'}
                    transition="all 120ms"
                  >
                    <HStack align="flex-start" gap="var(--space-2)">
                      <Box flexShrink={0} mt="2px">
                        {answered ? (
                          <CheckCircle2 size={12} strokeWidth={2} color="var(--leaf)" />
                        ) : (
                          <Circle size={12} strokeWidth={2} color="rgba(239,68,68,0.55)" />
                        )}
                      </Box>
                      <Box flex={1} minW={0}>
                        <Text
                          fontFamily="var(--font-sans)"
                          fontSize="11px"
                          color={answered ? 'rgba(252,252,253,0.55)' : 'rgba(252,100,100,0.80)'}
                          lineHeight={1.4}
                          noOfLines={2}
                        >
                          {q.question_text}
                        </Text>
                        {note && (
                          <HStack gap="4px" mt="4px">
                            <MessageSquare size={9} strokeWidth={1.5} color="rgba(234,179,8,0.55)" />
                            <Text fontSize="10px" color="rgba(234,179,8,0.55)" fontFamily="var(--font-sans)">
                              Notiz vorhanden
                            </Text>
                          </HStack>
                        )}
                      </Box>
                    </HStack>

                    <Box mt="var(--space-2)" display="flex" justifyContent="flex-end">
                      <Box
                        as="button"
                        onClick={() => setNoteModal(q)}
                        display="inline-flex"
                        alignItems="center"
                        gap="4px"
                        px="var(--space-3)"
                        h="24px"
                        borderRadius="var(--radius-2)"
                        fontFamily="var(--font-sans)"
                        fontSize="11px"
                        color="rgba(252,252,253,0.35)"
                        bg="transparent"
                        border="none"
                        cursor="pointer"
                        transition="all 120ms"
                        _hover={{ color: 'var(--leaf)', bg: 'rgba(74,124,92,0.15)' }}
                      >
                        <MessageSquare size={10} strokeWidth={1.5} />
                        {note ? 'Bearbeiten' : 'Notiz'}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </VStack>
          )}
        </Box>
      </MotionBox>

      {/* Admin Note Modal */}
      {noteModal && (
        <AdminNoteModal
          isOpen={!!noteModal}
          onClose={() => setNoteModal(null)}
          question={noteModal}
          targetUserId={viewingUserId}
          orgId={orgId}
          adminId={currentUserId}
          existingNote={getLatestNote(noteModal.id, viewingUserId)}
          onSaved={(note) => {
            onNoteAdded(note);
            setNoteModal(null);
          }}
        />
      )}
    </>
  );
}
