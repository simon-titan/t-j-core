'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Text, Tabs, TabList, Tab, TabPanels, TabPanel,
} from '@chakra-ui/react';
import { ChevronLeft, Pencil, AlertCircle } from 'lucide-react';
import { AdminNoteModal }  from '@/app/(app)/app/onboarding/[slug]/_components/AdminNoteModal';
import { AdminNoteBanner } from '@/app/(app)/app/onboarding/[slug]/_components/AdminNoteBanner';
import type {
  OnboardingModule, OnboardingAnswer, OnboardingQuestion,
} from '@/lib/types/database';
import type { SectionWithQuestions, AdminNoteWithAdmin } from '@/app/(app)/app/onboarding/_components/types';

interface TargetUser { id: string; full_name: string | null; role: string }

interface Props {
  org:               { id: string; name: string };
  targetUser:        TargetUser;
  module:            OnboardingModule;
  sections:          SectionWithQuestions[];
  answers:           OnboardingAnswer[];
  adminNotes:        AdminNoteWithAdmin[];
  adminId:           string;
  totalQuestions:    number;
  answeredQuestions: number;
}

export function AdminModuleDetailClient({
  org, targetUser, module, sections, answers: initialAnswers,
  adminNotes: initialNotes, adminId, totalQuestions, answeredQuestions,
}: Props) {
  const router = useRouter();

  const [activeTab,  setActiveTab]  = useState(0);
  const [adminNotes, setAdminNotes] = useState<AdminNoteWithAdmin[]>(initialNotes);
  const [noteModal,  setNoteModal]  = useState<{ question: OnboardingQuestion } | null>(null);

  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.order_index - b.order_index),
    [sections]
  );

  // O(1) answer lookup
  const answersMap = useMemo(() => {
    const m = new Map<string, OnboardingAnswer>();
    initialAnswers.forEach(a => m.set(a.question_id, a));
    return m;
  }, [initialAnswers]);

  // O(1) notes lookup by questionId → latest note
  const latestNoteMap = useMemo(() => {
    const m = new Map<string, AdminNoteWithAdmin>();
    [...adminNotes]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .forEach(n => {
        if (!m.has(n.question_id)) m.set(n.question_id, n);
      });
    return m;
  }, [adminNotes]);

  function handleNoteSaved(note: AdminNoteWithAdmin) {
    setAdminNotes(prev => [note, ...prev.filter(n => n.question_id !== note.question_id)]);
    setNoteModal(null);
  }

  const pct = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  return (
    <Box maxW="var(--admin-max-width)" mx="auto">
      {/* Breadcrumb */}
      <Box
        as="button"
        onClick={() => router.push(`/admin/orgs/${org.id}/users/${targetUser.id}`)}
        display="inline-flex"
        alignItems="center"
        gap={1}
        mb={6}
        fontFamily="var(--font-sans)"
        fontSize="13px"
        color="var(--mute)"
        bg="transparent"
        border="none"
        cursor="pointer"
        transition="color 120ms"
        _hover={{ color: 'var(--ink)' }}
      >
        <ChevronLeft size={14} strokeWidth={1.5} />
        {targetUser.full_name ?? 'Benutzer'}
      </Box>

      {/* Module Header */}
      <Box mb={6}>
        <Box display="flex" alignItems="center" gap={3} mb={3}>
          {/* Kicker */}
          <span
            className="label-kicker"
            style={{ display: 'block' }}
          >
            Onboarding-Modul
          </span>

          {/* Typ-Badge */}
          <Box
            as="span"
            display="inline-flex"
            px="8px"
            py="2px"
            borderRadius="var(--radius-full)"
            border="1px solid"
            fontSize="10px"
            fontFamily="var(--font-sans)"
            fontWeight={500}
            bg={module.type === 'workbook' ? 'rgba(74,124,92,0.10)' : 'var(--frost)'}
            borderColor={module.type === 'workbook' ? 'rgba(74,124,92,0.25)' : 'var(--mist)'}
            color={module.type === 'workbook' ? 'var(--forest)' : 'var(--mute)'}
          >
            {module.type === 'workbook' ? 'Workbook' : 'Reference'}
          </Box>

          {/* Read-only badge */}
          <Box
            as="span"
            display="inline-flex"
            px="8px"
            py="2px"
            borderRadius="var(--radius-full)"
            border="1px solid var(--mist)"
            fontSize="10px"
            fontFamily="var(--font-sans)"
            fontWeight={500}
            color="var(--mute)"
            bg="var(--frost)"
          >
            Read-only
          </Box>
        </Box>

        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '22px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            margin: '0 0 8px',
          }}
        >
          {module.title}
        </h1>

        {module.description && (
          <Text fontFamily="var(--font-sans)" fontSize="14px" color="var(--mute)" lineHeight={1.6} mb={4}>
            {module.description}
          </Text>
        )}

        {/* Progress bar */}
        <Box display="flex" alignItems="center" gap={4}>
          <Box flex={1} maxW="320px" h="4px" bg="var(--mist)" borderRadius="var(--radius-full)" overflow="hidden">
            <Box
              h="100%"
              borderRadius="var(--radius-full)"
              style={{
                width: `${pct}%`,
                background: 'var(--gradient-leaf-glow)',
                transition: 'width 500ms ease',
              }}
            />
          </Box>
          <Text fontFamily="var(--font-mono)" fontSize="12px" color="var(--mute)" flexShrink={0}>
            {answeredQuestions} / {totalQuestions}
          </Text>
        </Box>
      </Box>

      {/* Chase trail divider */}
      <Box position="relative" h="1px" w="100%" overflow="hidden" mb={6}>
        <Box
          position="absolute"
          inset={0}
          style={{ background: 'linear-gradient(90deg, transparent 0%, var(--forest) 50%, transparent 100%)' }}
        />
      </Box>

      {/* Section Tabs */}
      <Tabs
        index={activeTab}
        onChange={setActiveTab}
        isLazy
        variant="unstyled"
      >
        <TabList
          borderBottom="1px solid var(--mist)"
          overflowX="auto"
          overflowY="hidden"
          gap={0}
          mb={0}
          sx={{ '::-webkit-scrollbar': { display: 'none' } }}
        >
          {sortedSections.map((s, i) => (
            <Tab
              key={s.id}
              fontFamily="var(--font-sans)"
              fontSize="13px"
              fontWeight={activeTab === i ? 500 : 400}
              color={activeTab === i ? 'var(--ink)' : 'var(--mute)'}
              px={5}
              py={3}
              borderBottom="2px solid"
              borderColor={activeTab === i ? 'var(--ink)' : 'transparent'}
              mb="-1px"
              whiteSpace="nowrap"
              flexShrink={0}
              transition="all 120ms var(--ease-default)"
              _hover={{ color: 'var(--ink)' }}
              _selected={{}}
            >
              {s.title}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {sortedSections.map(section => {
            const questions = [...section.onboarding_questions].sort(
              (a, b) => a.order_index - b.order_index
            );

            return (
              <TabPanel key={section.id} px={0} pt={6} pb={0}>
                {section.description && (
                  <Text fontFamily="var(--font-sans)" fontSize="14px" color="var(--mute)" lineHeight={1.6} mb={5}>
                    {section.description}
                  </Text>
                )}

                <Box display="flex" flexDir="column" gap={3}>
                  {questions.map(q => {
                    const answer      = answersMap.get(q.id);
                    const latestNote  = latestNoteMap.get(q.id);
                    const hasAnswer   = answer
                      ? q.type === 'checkbox_group'
                        ? (answer.answer_json ?? []).length > 0
                        : (answer.answer_text ?? '').trim().length > 0
                      : false;
                    const isMissing   = q.is_required && !hasAnswer;

                    return (
                      <Box
                        key={q.id}
                        border="1px solid"
                        borderColor={isMissing ? 'rgba(239,68,68,0.35)' : 'var(--mist)'}
                        borderLeft={isMissing ? '3px solid #991B1B' : '1px solid var(--mist)'}
                        borderRadius="var(--radius-2)"
                        p={4}
                        bg={isMissing ? 'rgba(239,68,68,0.03)' : 'var(--paper)'}
                      >
                        {/* Question header */}
                        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={3} mb={3}>
                          <Box flex={1}>
                            <Box display="flex" alignItems="center" gap={2} mb={1}>
                              {q.is_required && (
                                <Box
                                  as="span"
                                  fontFamily="var(--font-mono)"
                                  fontSize="10px"
                                  color={isMissing ? '#991B1B' : 'var(--mute)'}
                                  fontWeight={500}
                                >
                                  Pflicht
                                </Box>
                              )}
                              {isMissing && (
                                <Box display="flex" alignItems="center" gap={1}>
                                  <AlertCircle size={11} strokeWidth={1.5} color="#991B1B" />
                                  <Text fontFamily="var(--font-mono)" fontSize="10px" color="#991B1B">
                                    Keine Antwort
                                  </Text>
                                </Box>
                              )}
                            </Box>
                            <Text
                              fontFamily="var(--font-sans)"
                              fontSize="14px"
                              fontWeight={500}
                              color="var(--ink)"
                              lineHeight={1.5}
                            >
                              {q.question_text}
                            </Text>
                            {q.helper_text && (
                              <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--mute)" mt={1} lineHeight={1.5}>
                                {q.helper_text}
                              </Text>
                            )}
                          </Box>

                          {/* Notiz-Button */}
                          <Box
                            as="button"
                            onClick={() => setNoteModal({ question: q })}
                            display="inline-flex"
                            alignItems="center"
                            gap={1}
                            h="28px"
                            px={2}
                            borderRadius="var(--radius-2)"
                            border="1px solid"
                            borderColor={latestNote ? 'rgba(234,179,8,0.40)' : 'var(--mist)'}
                            bg={latestNote ? 'rgba(234,179,8,0.08)' : 'transparent'}
                            fontFamily="var(--font-sans)"
                            fontSize="11px"
                            fontWeight={500}
                            color={latestNote ? '#854D0E' : 'var(--mute)'}
                            cursor="pointer"
                            flexShrink={0}
                            transition="all 120ms"
                            _hover={{
                              color: '#854D0E',
                              borderColor: 'rgba(234,179,8,0.40)',
                              bg: 'rgba(234,179,8,0.08)',
                            }}
                            title={latestNote ? 'Notiz bearbeiten' : 'Notiz schreiben'}
                          >
                            <Pencil size={11} strokeWidth={1.5} />
                            {latestNote ? 'Notiz' : 'Notiz +'}
                          </Box>
                        </Box>

                        {/* Answer display */}
                        {hasAnswer ? (
                          <Box
                            bg="var(--frost)"
                            border="1px solid var(--mist)"
                            borderRadius="var(--radius-2)"
                            px={4}
                            py={3}
                          >
                            {q.type === 'checkbox_group' ? (
                              <Box display="flex" flexWrap="wrap" gap={2}>
                                {(answer!.answer_json ?? []).map(val => (
                                  <Box
                                    key={val}
                                    as="span"
                                    px={3}
                                    py={1}
                                    borderRadius="var(--radius-full)"
                                    border="1px solid var(--mist)"
                                    bg="var(--paper)"
                                    fontFamily="var(--font-sans)"
                                    fontSize="12px"
                                    color="var(--ink)"
                                  >
                                    {val}
                                  </Box>
                                ))}
                              </Box>
                            ) : (
                              <Text
                                fontFamily="var(--font-sans)"
                                fontSize="14px"
                                color="var(--ink)"
                                lineHeight={1.6}
                                whiteSpace="pre-wrap"
                              >
                                {answer!.answer_text}
                              </Text>
                            )}
                          </Box>
                        ) : (
                          <Box
                            bg={isMissing ? 'rgba(239,68,68,0.04)' : 'var(--frost)'}
                            border="1px dashed"
                            borderColor={isMissing ? 'rgba(239,68,68,0.25)' : 'var(--mist)'}
                            borderRadius="var(--radius-2)"
                            px={4}
                            py={3}
                          >
                            <Text fontFamily="var(--font-sans)" fontSize="13px" color={isMissing ? '#991B1B' : 'var(--mute)'}>
                              {isMissing ? 'Pflichtfeld — noch nicht beantwortet' : 'Keine Antwort'}
                            </Text>
                          </Box>
                        )}

                        {/* Admin note banner */}
                        {latestNote && <AdminNoteBanner note={latestNote} />}
                      </Box>
                    );
                  })}
                </Box>
              </TabPanel>
            );
          })}
        </TabPanels>
      </Tabs>

      {/* Admin Note Modal */}
      {noteModal && (
        <AdminNoteModal
          isOpen={true}
          onClose={() => setNoteModal(null)}
          question={noteModal.question}
          targetUserId={targetUser.id}
          orgId={org.id}
          adminId={adminId}
          existingNote={latestNoteMap.get(noteModal.question.id)}
          onSaved={handleNoteSaved}
        />
      )}
    </Box>
  );
}
