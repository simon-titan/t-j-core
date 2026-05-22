'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Text, HStack, VStack } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, FileEdit, BookOpen,
  Plus, Pencil, Trash2, X, Check, ShieldAlert,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { t } from '@/lib/toast';
import type {
  OnboardingModule, OnboardingAnswer,
  ScriptTemplateStep, ScriptStepType, ScriptCallGroup,
} from '@/lib/types/database';
import type { SectionWithQuestions } from '../../_components/types';
import { SaveIndicator } from './SaveIndicator';

const MotionBox = motion(Box);

type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type Mode = 'builder' | 'vorlage';

interface Props {
  module:             OnboardingModule;
  sections:           SectionWithQuestions[];
  initialAnswers:     OnboardingAnswer[];
  templateSteps:      ScriptTemplateStep[];
  userId:             string;
  orgId:              string;
  isAdmin:            boolean;
  initialCustomNotes: string;
}

interface EditDraft {
  step_number: string;
  title:       string;
  step_type:   ScriptStepType;
  call_group:  ScriptCallGroup | null;
  body:        string;
  bulletsText: string;
}

const STEP_TYPE_LABELS: Record<ScriptStepType, string> = {
  group_header: 'Call-Phase',
  step:         'Schritt',
  substep:      'Unterpunkt',
  objection:    'Einwand',
};

export function ScriptModuleClient({
  module, sections, initialAnswers, templateSteps: initialTemplateSteps,
  userId, orgId, isAdmin, initialCustomNotes,
}: Props) {
  const router   = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>('builder');

  // ─── Builder state (answers) ──────────────────────────────────────────────
  const [answersMap, setAnswersMap] = useState<Map<string, OnboardingAnswer>>(() => {
    const m = new Map<string, OnboardingAnswer>();
    initialAnswers.forEach((a) => m.set(a.question_id, a));
    return m;
  });

  const [customNotes, setCustomNotes] = useState(initialCustomNotes);
  const [saveState, setSaveState]     = useState<SaveState>('idle');

  const saveTimers     = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const saveStateTimer = useRef<ReturnType<typeof setTimeout>>();
  const notesTimer     = useRef<ReturnType<typeof setTimeout>>();

  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.order_index - b.order_index),
    [sections]
  );

  const sectionQuestions = useMemo(
    () => sortedSections
      .map((s) => ({ section: s, question: s.onboarding_questions?.[0] }))
      .filter((x) => x.question),
    [sortedSections]
  );

  const answeredCount = useMemo(
    () => sectionQuestions.filter(({ question }) => {
      const ans = answersMap.get(question!.id);
      return (ans?.answer_text ?? '').trim().length > 0;
    }).length,
    [sectionQuestions, answersMap]
  );

  const total       = sectionQuestions.length;
  const progressPct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
  const isCompleted = progressPct === 100 && total > 0;

  function flashSaved() {
    setSaveState('saved');
    clearTimeout(saveStateTimer.current);
    saveStateTimer.current = setTimeout(() => setSaveState('idle'), 2000);
  }
  function flashError() {
    setSaveState('error');
    clearTimeout(saveStateTimer.current);
    saveStateTimer.current = setTimeout(() => setSaveState('idle'), 3000);
  }

  const handleAnswerChange = useCallback((questionId: string, value: string) => {
    setAnswersMap((prev) => {
      const next = new Map(prev);
      const existing = prev.get(questionId);
      next.set(questionId, {
        ...(existing ?? {
          id: '', question_id: questionId, user_id: userId, org_id: orgId,
          answer_json: null, created_at: new Date().toISOString(),
        }),
        answer_text: value,
        visibility: 'private',
        updated_at: new Date().toISOString(),
      } as OnboardingAnswer);
      return next;
    });

    setSaveState('saving');
    clearTimeout(saveStateTimer.current);

    const existingTimer = saveTimers.current.get(questionId);
    if (existingTimer) clearTimeout(existingTimer);

    const timer = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('onboarding_answers')
          .upsert(
            {
              question_id: questionId, user_id: userId, org_id: orgId,
              answer_text: value || null, answer_json: null, visibility: 'private',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'question_id,user_id' }
          );
        if (error) throw error;
        flashSaved();
      } catch {
        flashError();
      }
    }, 1000);

    saveTimers.current.set(questionId, timer);
  }, [userId, orgId, supabase]);

  function handleNotesChange(value: string) {
    setCustomNotes(value);
    setSaveState('saving');
    clearTimeout(saveStateTimer.current);
    clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('user_pitch_scripts')
          .upsert(
            {
              user_id: userId, org_id: orgId, module_slug: module.slug,
              content: value, updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,module_slug' }
          );
        if (error) throw error;
        flashSaved();
      } catch {
        flashError();
      }
    }, 1000);
  }

  // ─── Vorlage / admin template editing ──────────────────────────────────────
  const [templateSteps, setTemplateSteps] = useState<ScriptTemplateStep[]>(
    () => [...initialTemplateSteps].sort((a, b) => a.order_index - b.order_index)
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft]         = useState<EditDraft | null>(null);

  function startEdit(step: ScriptTemplateStep) {
    setEditingId(step.id);
    setDraft({
      step_number: step.step_number,
      title:       step.title,
      step_type:   step.step_type,
      call_group:  step.call_group,
      body:        step.body ?? '',
      bulletsText: (step.bullets ?? []).join('\n'),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
  }

  async function saveEdit() {
    if (!editingId || !draft) return;
    const bullets = draft.bulletsText
      .split('\n').map((s) => s.trim()).filter(Boolean);
    const patch = {
      step_number: draft.step_number.trim(),
      title:       draft.title.trim(),
      step_type:   draft.step_type,
      call_group:  draft.call_group,
      body:        draft.body.trim() || null,
      bullets:     bullets.length > 0 ? bullets : null,
      updated_at:  new Date().toISOString(),
    };

    setTemplateSteps((prev) =>
      prev.map((s) => (s.id === editingId ? { ...s, ...patch } as ScriptTemplateStep : s))
    );
    const idToSave = editingId;
    cancelEdit();

    const { error } = await (supabase.from('script_template_steps') as any)
      .update(patch).eq('id', idToSave);
    if (error) { t.error('Vorlage konnte nicht gespeichert werden'); }
    else       { t.success('Vorlage aktualisiert'); }
  }

  async function addStep() {
    const maxOrder = templateSteps.reduce((m, s) => Math.max(m, s.order_index), 0);
    const lastGroup = [...templateSteps].reverse().find((s) => s.call_group)?.call_group ?? null;
    const insert = {
      module_slug: module.slug,
      step_number: '',
      title:       'Neuer Schritt',
      step_type:   'step' as ScriptStepType,
      body:        null,
      bullets:     null,
      call_group:  lastGroup,
      order_index: maxOrder + 1,
    };
    const { data, error } = await (supabase.from('script_template_steps') as any)
      .insert(insert).select('*').single() as { data: ScriptTemplateStep | null; error: any };
    if (error || !data) { t.error('Schritt konnte nicht angelegt werden'); return; }
    setTemplateSteps((prev) => [...prev, data]);
    startEdit(data);
  }

  async function deleteStep(id: string) {
    if (!window.confirm('Diesen Schritt der Vorlage wirklich löschen?')) return;
    setTemplateSteps((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) cancelEdit();
    const { error } = await (supabase.from('script_template_steps') as any)
      .delete().eq('id', id);
    if (error) t.error('Schritt konnte nicht gelöscht werden');
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Box>
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
        <Box
          position="absolute"
          inset={0}
          pointerEvents="none"
          style={{ background: 'radial-gradient(ellipse 70% 100% at 90% 50%, rgba(45,84,67,0.40) 0%, transparent 65%)' }}
        />

        <Box position="relative">
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
              — Sales Skript
            </Text>
          </MotionBox>

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
            <HStack gap="var(--space-4)" align="center">
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
                  {answeredCount}/{total} Abschnitte
                </Text>
              </HStack>
            </HStack>
          </MotionBox>
        </Box>
      </Box>

      {/* ─── STICKY MODE TABS ─────────────────────────────────────────────── */}
      <Box
        position="sticky"
        top="var(--nav-height)"
        zIndex={20}
        bg="rgba(252,252,253,0.88)"
        borderBottom="1px solid var(--mist)"
        mx={{ base: '-20px', md: '-32px' }}
        style={{ backdropFilter: 'blur(12px) saturate(1.4)' }}
      >
        <Box px={{ base: '20px', md: '32px' }}>
          <HStack gap="var(--space-2)" py="var(--space-3)">
            <ModeTab active={mode === 'builder'} onClick={() => setMode('builder')} icon={FileEdit} label="Mein Skript" />
            <ModeTab active={mode === 'vorlage'} onClick={() => setMode('vorlage')} icon={BookOpen}  label="T&J Vorlage" />
          </HStack>
        </Box>
      </Box>

      {/* ─── CONTENT ──────────────────────────────────────────────────────── */}
      <Box pb="var(--space-10)" pt="var(--space-7)">
        <AnimatePresence mode="wait">
          {mode === 'builder' ? (
            <MotionBox
              key="builder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
            >
              <BuilderView
                sectionQuestions={sectionQuestions}
                answersMap={answersMap}
                onAnswer={handleAnswerChange}
                customNotes={customNotes}
                onNotesChange={handleNotesChange}
              />
            </MotionBox>
          ) : (
            <MotionBox
              key="vorlage"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
            >
              <VorlageView
                steps={templateSteps}
                isAdmin={isAdmin}
                editingId={editingId}
                draft={draft}
                setDraft={setDraft}
                onStartEdit={startEdit}
                onCancelEdit={cancelEdit}
                onSaveEdit={saveEdit}
                onDelete={deleteStep}
                onAddStep={addStep}
              />
            </MotionBox>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}

// ─── Mode tab pill ─────────────────────────────────────────────────────────
function ModeTab({
  active, onClick, icon: Icon, label,
}: { active: boolean; onClick: () => void; icon: React.ElementType; label: string }) {
  return (
    <Box
      as="button"
      onClick={onClick}
      display="inline-flex"
      alignItems="center"
      gap="7px"
      px="var(--space-4)"
      py="var(--space-2)"
      borderRadius="var(--radius-full)"
      fontFamily="var(--font-sans)"
      fontSize="13px"
      fontWeight={active ? 500 : 400}
      cursor="pointer"
      border="1px solid"
      transition="all 140ms var(--ease-default)"
      style={
        active
          ? { background: 'var(--forest)', color: 'var(--paper)', borderColor: 'var(--forest)', boxShadow: 'var(--shadow-1)' }
          : { background: 'transparent', color: 'var(--mute)', borderColor: 'transparent' }
      }
      _hover={active ? {} : { color: 'var(--ink)', borderColor: 'var(--mist)' }}
    >
      <Icon size={14} strokeWidth={1.75} />
      {label}
    </Box>
  );
}

// ─── BUILDER VIEW ────────────────────────────────────────────────────────────
function BuilderView({
  sectionQuestions, answersMap, onAnswer, customNotes, onNotesChange,
}: {
  sectionQuestions: { section: SectionWithQuestions; question: any }[];
  answersMap: Map<string, OnboardingAnswer>;
  onAnswer: (questionId: string, value: string) => void;
  customNotes: string;
  onNotesChange: (value: string) => void;
}) {
  return (
    <VStack align="stretch" spacing="var(--space-4)">
      <Text
        fontFamily="var(--font-sans)"
        fontSize="14px"
        color="var(--mute)"
        lineHeight={1.6}
        maxW="680px"
      >
        Bau dir Schritt für Schritt dein eigenes Skript. Jeder Abschnitt wird automatisch
        gespeichert. Die T&J-Vorlage findest du oben im Tab „T&J Vorlage“ als Inspiration.
      </Text>

      {sectionQuestions.map(({ section, question }, idx) => {
        const value  = answersMap.get(question.id)?.answer_text ?? '';
        const filled = value.trim().length > 0;
        return (
          <Box
            key={question.id}
            bg="var(--paper)"
            border="1px solid var(--mist)"
            borderLeft="3px solid"
            borderLeftColor={filled ? 'var(--forest)' : 'var(--mist)'}
            borderRadius="var(--radius-3)"
            p="var(--space-5)"
            transition="border-color 150ms ease"
          >
            <HStack align="center" gap="var(--space-3)" mb="var(--space-3)">
              <Box
                fontFamily="var(--font-mono)"
                fontSize="12px"
                fontWeight={600}
                color={filled ? 'var(--forest)' : 'var(--mist)'}
                flexShrink={0}
              >
                {String(idx + 1).padStart(2, '0')}
              </Box>
              <Text
                fontFamily="var(--font-sans)"
                fontSize="15px"
                fontWeight={600}
                letterSpacing="-0.01em"
                color="var(--ink)"
              >
                {section.title}
              </Text>
              {filled && <CheckCircle2 size={15} strokeWidth={2} color="var(--forest)" style={{ marginLeft: 'auto' }} />}
            </HStack>

            {question.helper_text && (
              <Box
                bg="var(--frost)"
                border="1px solid var(--mist)"
                borderRadius="var(--radius-2)"
                px="var(--space-3)"
                py="var(--space-2)"
                mb="var(--space-3)"
              >
                <Text
                  fontFamily="var(--font-sans)"
                  fontSize="12.5px"
                  color="var(--mute)"
                  lineHeight={1.55}
                >
                  {question.helper_text}
                </Text>
              </Box>
            )}

            <textarea
              value={value}
              onChange={(e) => onAnswer(question.id, e.target.value)}
              placeholder={`Deine Formulierung für „${section.title}“ …`}
              rows={4}
              style={{
                width: '100%', padding: '12px 14px',
                fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.7,
                color: 'var(--ink)', background: 'var(--paper)',
                border: '1px solid var(--mist)', borderRadius: 'var(--radius-2)',
                outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                transition: 'border-color 150ms ease', whiteSpace: 'pre-wrap',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--forest)'; }}
              onBlur={(e)  => { e.target.style.borderColor = 'var(--mist)'; }}
            />
          </Box>
        );
      })}

      {/* Eigene Ergänzungen */}
      <Box mt="var(--space-6)" pt="var(--space-7)" borderTop="1px solid var(--mist)">
        <Text
          fontFamily="var(--font-mono)"
          fontSize="10px"
          fontWeight={500}
          letterSpacing="0.14em"
          textTransform="uppercase"
          color="var(--leaf)"
          mb="var(--space-3)"
        >
          — Eigene Ergänzungen
        </Text>
        <Text
          fontFamily="var(--font-sans)"
          fontSize="13px"
          color="var(--mute)"
          lineHeight={1.6}
          mb="var(--space-4)"
        >
          Platz für zusätzliche Fragen, eigene Abschnitte oder Notizen, die über die Struktur hinausgehen.
        </Text>
        <textarea
          value={customNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Eigene Fragen, Übergänge, Erinnerungen …"
          rows={8}
          style={{
            width: '100%', padding: '14px 16px',
            fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.75,
            color: 'var(--ink)', background: 'var(--paper)',
            border: '1px solid var(--mist)', borderRadius: 'var(--radius-3)',
            outline: 'none', resize: 'vertical', boxSizing: 'border-box',
            transition: 'border-color 150ms ease', whiteSpace: 'pre-wrap',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--forest)'; }}
          onBlur={(e)  => { e.target.style.borderColor = 'var(--mist)'; }}
        />
      </Box>
    </VStack>
  );
}

// ─── VORLAGE VIEW ────────────────────────────────────────────────────────────
function VorlageView({
  steps, isAdmin, editingId, draft, setDraft,
  onStartEdit, onCancelEdit, onSaveEdit, onDelete, onAddStep,
}: {
  steps: ScriptTemplateStep[];
  isAdmin: boolean;
  editingId: string | null;
  draft: EditDraft | null;
  setDraft: (d: EditDraft) => void;
  onStartEdit: (s: ScriptTemplateStep) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: (id: string) => void;
  onAddStep: () => void;
}) {
  if (steps.length === 0 && !isAdmin) {
    return (
      <Box textAlign="center" py="var(--space-10)" color="var(--mute)" fontFamily="var(--font-sans)" fontSize="14px">
        Für dieses Modul ist noch keine T&J-Vorlage hinterlegt.
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing="var(--space-4)">
      {isAdmin && (
        <HStack
          bg="rgba(74,124,92,0.06)"
          border="1px solid rgba(74,124,92,0.20)"
          borderRadius="var(--radius-2)"
          px="var(--space-4)"
          py="var(--space-3)"
          gap="var(--space-3)"
        >
          <ShieldAlert size={15} strokeWidth={1.75} color="var(--forest)" />
          <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--forest)">
            Admin-Modus: Du kannst Schritte bearbeiten, hinzufügen oder löschen. Änderungen sind für alle sichtbar.
          </Text>
        </HStack>
      )}

      {steps.map((step) =>
        editingId === step.id && draft ? (
          <StepEditForm
            key={step.id}
            draft={draft}
            setDraft={setDraft}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
          />
        ) : (
          <TemplateStepCard
            key={step.id}
            step={step}
            isAdmin={isAdmin}
            onEdit={() => onStartEdit(step)}
            onDelete={() => onDelete(step.id)}
          />
        )
      )}

      {isAdmin && (
        <Box
          as="button"
          onClick={onAddStep}
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap="8px"
          w="100%"
          py="var(--space-4)"
          mt="var(--space-2)"
          bg="transparent"
          border="1.5px dashed var(--mist)"
          borderRadius="var(--radius-3)"
          color="var(--mute)"
          cursor="pointer"
          fontFamily="var(--font-sans)"
          fontSize="13px"
          fontWeight={500}
          transition="all 150ms ease"
          _hover={{ borderColor: 'var(--forest)', color: 'var(--forest)', bg: 'rgba(74,124,92,0.04)' }}
        >
          <Plus size={16} strokeWidth={2} />
          Schritt hinzufügen
        </Box>
      )}
    </VStack>
  );
}

// ─── Single template step (read mode) ───────────────────────────────────────
function TemplateStepCard({
  step, isAdmin, onEdit, onDelete,
}: {
  step: ScriptTemplateStep;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  // Group header → dark divider
  if (step.step_type === 'group_header') {
    return (
      <Box
        bg="var(--forest-deep)"
        borderRadius="var(--radius-3)"
        px="var(--space-6)"
        py="var(--space-4)"
        mt="var(--space-3)"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute" inset={0} pointerEvents="none"
          style={{ background: 'radial-gradient(ellipse 60% 100% at 85% 50%, rgba(45,84,67,0.45) 0%, transparent 70%)' }}
        />
        <HStack position="relative" justify="space-between">
          <Text
            fontFamily="var(--font-display)"
            fontStyle="italic"
            fontSize="clamp(20px, 2.6vw, 28px)"
            letterSpacing="-0.02em"
            color="var(--paper)"
          >
            {step.title}
          </Text>
          {isAdmin && <AdminStepActions onEdit={onEdit} onDelete={onDelete} light />}
        </HStack>
      </Box>
    );
  }

  const isObjection = step.step_type === 'objection';
  const isSubstep   = step.step_type === 'substep';

  return (
    <Box
      bg="var(--paper)"
      border="1px solid var(--mist)"
      borderLeft={isObjection ? '3px solid #EF4444' : isSubstep ? '3px solid var(--leaf)' : '1px solid var(--mist)'}
      borderRadius="var(--radius-3)"
      p="var(--space-5)"
      ml={isSubstep ? { base: 0, md: 'var(--space-6)' } : 0}
    >
      <HStack align="flex-start" justify="space-between" mb={step.body || (step.bullets?.length ?? 0) > 0 ? 'var(--space-3)' : 0}>
        <HStack align="baseline" gap="var(--space-3)" flex={1} minW={0}>
          {step.step_number && (
            <Text
              fontFamily="var(--font-mono)"
              fontSize={isSubstep ? '12px' : '14px'}
              fontWeight={600}
              color={isObjection ? '#991B1B' : 'var(--forest)'}
              flexShrink={0}
            >
              {step.step_number}
            </Text>
          )}
          <Text
            fontFamily="var(--font-sans)"
            fontStyle={isObjection ? 'italic' : 'normal'}
            fontSize={isSubstep ? '14px' : '15.5px'}
            fontWeight={isObjection ? 600 : isSubstep ? 600 : 700}
            letterSpacing="-0.01em"
            color={isObjection ? '#991B1B' : 'var(--ink)'}
            lineHeight={1.35}
          >
            {isObjection
              ? <><span style={{ opacity: 0.6 }}>Einwand: </span>„{step.title}“</>
              : step.title}
          </Text>
        </HStack>
        {isAdmin && <AdminStepActions onEdit={onEdit} onDelete={onDelete} />}
      </HStack>

      {step.body && (
        <Text
          fontFamily="var(--font-sans)"
          fontSize="14px"
          color="var(--ink)"
          lineHeight={1.7}
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {step.body}
        </Text>
      )}

      {(step.bullets?.length ?? 0) > 0 && (
        <VStack align="stretch" spacing="6px" mt={step.body ? 'var(--space-3)' : 0}>
          {step.bullets!.map((b, i) => (
            <HStack key={i} align="flex-start" gap="10px">
              <Box
                w="5px" h="5px" mt="8px" flexShrink={0}
                borderRadius="50%"
                bg={isObjection ? '#EF4444' : 'var(--forest)'}
              />
              <Text fontFamily="var(--font-sans)" fontSize="14px" color="var(--ink)" lineHeight={1.65}>
                {b}
              </Text>
            </HStack>
          ))}
        </VStack>
      )}
    </Box>
  );
}

// ─── Admin action buttons ────────────────────────────────────────────────────
function AdminStepActions({
  onEdit, onDelete, light = false,
}: { onEdit: () => void; onDelete: () => void; light?: boolean }) {
  const color      = light ? 'rgba(252,252,253,0.55)' : 'var(--mute)';
  const hoverColor = light ? 'var(--paper)' : 'var(--ink)';
  return (
    <HStack gap="4px" flexShrink={0}>
      <Box
        as="button" onClick={onEdit}
        display="flex" alignItems="center" justifyContent="center"
        w="28px" h="28px" borderRadius="var(--radius-2)"
        bg="transparent" border="none" cursor="pointer" color={color}
        transition="all 120ms"
        _hover={{ bg: light ? 'rgba(252,252,253,0.10)' : 'var(--ink-04)', color: hoverColor }}
        aria-label="Bearbeiten"
      >
        <Pencil size={14} strokeWidth={1.75} />
      </Box>
      <Box
        as="button" onClick={onDelete}
        display="flex" alignItems="center" justifyContent="center"
        w="28px" h="28px" borderRadius="var(--radius-2)"
        bg="transparent" border="none" cursor="pointer" color={color}
        transition="all 120ms"
        _hover={{ bg: 'rgba(239,68,68,0.10)', color: '#EF4444' }}
        aria-label="Löschen"
      >
        <Trash2 size={14} strokeWidth={1.75} />
      </Box>
    </HStack>
  );
}

// ─── Step edit form (admin) ──────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  fontFamily: 'var(--font-sans)', fontSize: '13px',
  color: 'var(--ink)', background: 'var(--paper)',
  border: '1px solid var(--mist)', borderRadius: 'var(--radius-2)',
  outline: 'none', boxSizing: 'border-box',
};

function StepEditForm({
  draft, setDraft, onSave, onCancel,
}: {
  draft: EditDraft;
  setDraft: (d: EditDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const showCallGroup = draft.call_group !== null
    || draft.step_type === 'group_header';

  return (
    <Box
      bg="var(--frost)"
      border="1.5px solid var(--forest)"
      borderRadius="var(--radius-3)"
      p="var(--space-5)"
    >
      <Text
        fontFamily="var(--font-mono)"
        fontSize="10px"
        fontWeight={600}
        letterSpacing="0.12em"
        textTransform="uppercase"
        color="var(--forest)"
        mb="var(--space-4)"
      >
        — Schritt bearbeiten
      </Text>

      <VStack align="stretch" spacing="var(--space-3)">
        <HStack gap="var(--space-3)" align="flex-start">
          <Box w="90px" flexShrink={0}>
            <FieldLabel>Nr.</FieldLabel>
            <input
              style={inputStyle}
              value={draft.step_number}
              onChange={(e) => setDraft({ ...draft, step_number: e.target.value })}
              placeholder="1 / 9.1"
            />
          </Box>
          <Box flex={1}>
            <FieldLabel>Titel</FieldLabel>
            <input
              style={inputStyle}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Titel des Schritts"
            />
          </Box>
        </HStack>

        <HStack gap="var(--space-3)" align="flex-start" flexWrap="wrap">
          <Box flex={1} minW="160px">
            <FieldLabel>Typ</FieldLabel>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={draft.step_type}
              onChange={(e) => setDraft({ ...draft, step_type: e.target.value as ScriptStepType })}
            >
              {(Object.keys(STEP_TYPE_LABELS) as ScriptStepType[]).map((k) => (
                <option key={k} value={k}>{STEP_TYPE_LABELS[k]}</option>
              ))}
            </select>
          </Box>
          {showCallGroup && (
            <Box flex={1} minW="160px">
              <FieldLabel>Call-Phase</FieldLabel>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={draft.call_group ?? ''}
                onChange={(e) => setDraft({ ...draft, call_group: (e.target.value || null) as ScriptCallGroup | null })}
              >
                <option value="">—</option>
                <option value="setting">Setting Call</option>
                <option value="closing">Closing Call</option>
              </select>
            </Box>
          )}
        </HStack>

        <Box>
          <FieldLabel>Inhalt</FieldLabel>
          <textarea
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}
            rows={6}
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            placeholder="Fließtext (Zeilenumbrüche bleiben erhalten)"
          />
        </Box>

        <Box>
          <FieldLabel>Bullets (eine pro Zeile)</FieldLabel>
          <textarea
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            rows={3}
            value={draft.bulletsText}
            onChange={(e) => setDraft({ ...draft, bulletsText: e.target.value })}
            placeholder={'Erster Punkt\nZweiter Punkt'}
          />
        </Box>

        <HStack justify="flex-end" gap="var(--space-2)" pt="var(--space-1)">
          <Box
            as="button" onClick={onCancel}
            display="inline-flex" alignItems="center" gap="6px"
            px="var(--space-4)" py="8px" borderRadius="var(--radius-2)"
            bg="transparent" border="1px solid var(--mist)" cursor="pointer"
            fontFamily="var(--font-sans)" fontSize="13px" color="var(--mute)"
            transition="all 120ms" _hover={{ borderColor: 'var(--ink)', color: 'var(--ink)' }}
          >
            <X size={14} strokeWidth={2} /> Abbrechen
          </Box>
          <Box
            as="button" onClick={onSave}
            display="inline-flex" alignItems="center" gap="6px"
            px="var(--space-4)" py="8px" borderRadius="var(--radius-2)"
            bg="var(--forest)" border="1px solid var(--forest)" cursor="pointer"
            fontFamily="var(--font-sans)" fontSize="13px" fontWeight={500} color="var(--paper)"
            transition="all 120ms" _hover={{ bg: 'var(--forest-deep)' }}
          >
            <Check size={14} strokeWidth={2} /> Speichern
          </Box>
        </HStack>
      </VStack>
    </Box>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      fontFamily="var(--font-mono)"
      fontSize="10px"
      fontWeight={500}
      letterSpacing="0.08em"
      textTransform="uppercase"
      color="var(--mute)"
      mb="6px"
    >
      {children}
    </Text>
  );
}
