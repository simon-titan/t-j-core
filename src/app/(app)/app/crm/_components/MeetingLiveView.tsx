'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Text, HStack, VStack, Textarea } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Circle,
  Send,
  Mail,
  Phone,
  Calendar,
  Clock,
  Notebook,
  Zap,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  FileText,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { t } from '@/lib/toast';
import type { KanbanLead, KanbanAppointment, MeetingNote, NoteType } from './types';
import { NOTE_TYPE_CONFIG, MEETING_TYPE_LABELS, getInitials } from './types';

const MotionBox = motion(Box);

const NOTE_TYPE_ICONS: Record<NoteType, React.ReactNode> = {
  note:      <FileText size={12} strokeWidth={1.5} />,
  action:    <Zap size={12} strokeWidth={1.5} />,
  question:  <HelpCircle size={12} strokeWidth={1.5} />,
  objection: <AlertTriangle size={12} strokeWidth={1.5} />,
  insight:   <Lightbulb size={12} strokeWidth={1.5} />,
};

function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function fmtTimestamp(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

interface Props {
  appointment: KanbanAppointment;
  lead: KanbanLead;
  userId: string;
  orgId: string;
  onClose: () => void;
  onNotesUpdate: (updatedAppt: KanbanAppointment) => void;
}

export function MeetingLiveView({ appointment, lead, userId, orgId, onClose, onNotesUpdate }: Props) {
  const supabase = createClient();
  const [notes, setNotes] = useState<MeetingNote[]>(appointment.meeting_notes ?? []);
  const [inputContent, setInputContent] = useState('');
  const [selectedType, setSelectedType] = useState<NoteType>('note');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const feedEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isLive = appointment.status === 'scheduled';
  const prospect = lead.prospect;
  const initials = getInitials(prospect.first_name, prospect.last_name);
  const fullName = `${prospect.first_name} ${prospect.last_name}`;

  // Timer — only in live mode
  useEffect(() => {
    if (!isLive) return;
    const id = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isLive]);

  // Scroll feed to bottom when new notes are added
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notes.length]);

  // Escape to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (inputContent.trim()) {
          if (window.confirm('Meeting verlassen? Nicht gesendete Eingabe wird verworfen.')) onClose();
        } else {
          onClose();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inputContent, onClose]);

  const handleSubmit = useCallback(async () => {
    const content = inputContent.trim();
    if (!content || isSubmitting) return;

    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const optimistic: MeetingNote = {
      id: tempId,
      appointment_id: appointment.id,
      organization_id: orgId,
      created_by: userId,
      note_type: selectedType,
      content,
      created_at: now,
      updated_at: now,
    };

    setNotes((prev) => [...prev, optimistic]);
    setInputContent('');
    setIsSubmitting(true);

    const { data, error } = await (supabase.from('meeting_notes') as any)
      .insert({
        appointment_id: appointment.id,
        organization_id: orgId,
        created_by: userId,
        note_type: selectedType,
        content,
      })
      .select('*')
      .single() as { data: any; error: any };

    setIsSubmitting(false);

    if (error) {
      setNotes((prev) => prev.filter((n) => n.id !== tempId));
      t.error('Eintrag konnte nicht gespeichert werden');
    } else {
      const savedNote = data as MeetingNote;
      setNotes((prev) => prev.map((n) => (n.id === tempId ? savedNote : n)));
      onNotesUpdate({ ...appointment, meeting_notes: [...(appointment.meeting_notes ?? []).filter(n => !n.id.startsWith('temp-')), savedNote] });
    }
  }, [inputContent, isSubmitting, selectedType, appointment, orgId, userId, supabase, onNotesUpdate]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const NOTE_TYPES: NoteType[] = ['note', 'action', 'question', 'objection', 'insight'];

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      position="fixed"
      inset={0}
      zIndex={300}
      display="flex"
      flexDirection="column"
      bg="var(--paper)"
    >
      {/* ── Header ── */}
      <Box
        bg="linear-gradient(135deg, #0A0F0D 0%, #122620 100%)"
        h="64px"
        flexShrink={0}
        px="24px"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        position="relative"
        overflow="hidden"
      >
        {/* Top accent line */}
        <Box
          position="absolute"
          top={0} left={0} right={0} h="2px"
          bg="linear-gradient(90deg, transparent 0%, rgba(74,124,92,0.8) 40%, rgba(74,124,92,0.3) 100%)"
        />

        {/* Left: Back button + title */}
        <HStack spacing="16px">
          <Box
            as="button"
            onClick={onClose}
            display="flex"
            alignItems="center"
            gap="6px"
            color="rgba(252,252,253,0.50)"
            _hover={{ color: 'var(--paper)' }}
            transition="color 150ms ease"
            fontFamily="var(--font-sans)"
            fontSize="13px"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Zurück
          </Box>

          <Box w="1px" h="20px" bg="rgba(252,252,253,0.12)" />

          <VStack align="flex-start" spacing={0}>
            <Text
              fontFamily="var(--font-display)"
              fontStyle="italic"
              fontSize="16px"
              lineHeight={1.2}
              letterSpacing="-0.02em"
              color="var(--paper)"
              noOfLines={1}
            >
              {fullName}
            </Text>
            {appointment.meeting_type && (
              <Text
                fontFamily="var(--font-mono)"
                fontSize="10px"
                letterSpacing="0.10em"
                textTransform="uppercase"
                color="rgba(252,252,253,0.40)"
              >
                {MEETING_TYPE_LABELS[appointment.meeting_type]}
              </Text>
            )}
          </VStack>
        </HStack>

        {/* Center: Timer / Status */}
        {isLive ? (
          <HStack spacing="8px">
            <Box w="7px" h="7px" borderRadius="full" bg="#EF4444" boxShadow="0 0 8px #EF4444" />
            <Text
              fontFamily="var(--font-mono)"
              fontSize="14px"
              letterSpacing="0.08em"
              color="var(--paper)"
            >
              {formatTimer(timerSeconds)}
            </Text>
          </HStack>
        ) : (
          <HStack spacing="6px">
            <Clock size={12} color="rgba(252,252,253,0.40)" />
            <Text
              fontFamily="var(--font-mono)"
              fontSize="11px"
              color="rgba(252,252,253,0.40)"
              letterSpacing="0.06em"
            >
              Rückblick
            </Text>
          </HStack>
        )}

        {/* Right: Notes count */}
        <HStack spacing="8px">
          <HStack spacing="5px">
            <Notebook size={13} color="rgba(252,252,253,0.40)" />
            <Text fontFamily="var(--font-mono)" fontSize="12px" color="rgba(252,252,253,0.50)">
              {notes.length} {notes.length === 1 ? 'Eintrag' : 'Einträge'}
            </Text>
          </HStack>
        </HStack>
      </Box>

      {/* ── Body (sidebar + feed) ── */}
      <Box flex={1} minH={0} display="flex" overflow="hidden">

        {/* Sidebar */}
        <Box
          w="280px"
          flexShrink={0}
          bg="linear-gradient(180deg, rgba(18,38,32,0.06) 0%, rgba(74,124,92,0.04) 100%)"
          borderRight="1px solid var(--mist)"
          display="flex"
          flexDirection="column"
          overflowY="auto"
          px="20px"
          py="24px"
        >
          {/* Lead Avatar + Info */}
          <HStack spacing="12px" mb="20px">
            <Box
              w="44px"
              h="44px"
              flexShrink={0}
              borderRadius="var(--radius-full)"
              bg="var(--forest)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontFamily="var(--font-sans)" fontSize="15px" fontWeight={700} color="var(--paper)" lineHeight={1}>
                {initials}
              </Text>
            </Box>
            <VStack align="flex-start" spacing="2px" flex={1} minW={0}>
              <Text fontFamily="var(--font-sans)" fontSize="14px" fontWeight={600} color="var(--ink)" noOfLines={1}>
                {fullName}
              </Text>
              {prospect.company && (
                <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--mute)" noOfLines={1}>
                  {prospect.company}
                </Text>
              )}
            </VStack>
          </HStack>

          {/* Appointment info */}
          <VStack align="stretch" spacing="10px" mb="20px">
            <Box h="1px" bg="var(--mist)" />
            <Text
              fontFamily="var(--font-mono)"
              fontSize="9px"
              letterSpacing="0.12em"
              textTransform="uppercase"
              color="var(--mute)"
            >
              — Meeting-Details
            </Text>

            <HStack spacing="8px">
              <Calendar size={13} strokeWidth={1.5} color="var(--mute)" style={{ flexShrink: 0 }} />
              <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--ink)">
                {fmtDate(appointment.scheduled_at)}
              </Text>
            </HStack>

            {appointment.duration_minutes && (
              <HStack spacing="8px">
                <Clock size={13} strokeWidth={1.5} color="var(--mute)" style={{ flexShrink: 0 }} />
                <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--ink)">
                  {appointment.duration_minutes} Minuten
                </Text>
              </HStack>
            )}

            {appointment.location && (
              <HStack spacing="8px">
                <Box flexShrink={0} w="13px" h="13px" display="flex" alignItems="center" justifyContent="center">
                  <Circle size={8} color="var(--mute)" />
                </Box>
                <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--mute)" noOfLines={1}>
                  {appointment.location}
                </Text>
              </HStack>
            )}

            {appointment.title && (
              <Box
                bg="rgba(74,124,92,0.06)"
                borderRadius="var(--radius-2)"
                border="1px solid rgba(74,124,92,0.12)"
                px="10px"
                py="8px"
              >
                <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--ink)" lineHeight={1.5}>
                  {appointment.title}
                </Text>
              </Box>
            )}
          </VStack>

          {/* Quick contacts */}
          {(prospect.email || prospect.phone) && (
            <VStack align="stretch" spacing="8px">
              <Box h="1px" bg="var(--mist)" />
              <Text
                fontFamily="var(--font-mono)"
                fontSize="9px"
                letterSpacing="0.12em"
                textTransform="uppercase"
                color="var(--mute)"
              >
                — Kontakt
              </Text>
              {prospect.email && (
                <HStack
                  as="a"
                  href={`mailto:${prospect.email}`}
                  spacing="8px"
                  color="var(--mute)"
                  _hover={{ color: 'var(--forest)' }}
                  transition="color 150ms"
                >
                  <Mail size={12} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                  <Text fontFamily="var(--font-sans)" fontSize="11px" noOfLines={1}>
                    {prospect.email}
                  </Text>
                </HStack>
              )}
              {prospect.phone && (
                <HStack
                  as="a"
                  href={`tel:${prospect.phone}`}
                  spacing="8px"
                  color="var(--mute)"
                  _hover={{ color: 'var(--forest)' }}
                  transition="color 150ms"
                >
                  <Phone size={12} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                  <Text fontFamily="var(--font-sans)" fontSize="11px" noOfLines={1}>
                    {prospect.phone}
                  </Text>
                </HStack>
              )}
            </VStack>
          )}

          {/* Note type legend */}
          <Box mt="auto" pt="20px">
            <Box h="1px" bg="var(--mist)" mb="12px" />
            <Text
              fontFamily="var(--font-mono)"
              fontSize="9px"
              letterSpacing="0.12em"
              textTransform="uppercase"
              color="var(--mute)"
              mb="8px"
            >
              — Eintragstypen
            </Text>
            <VStack align="stretch" spacing="4px">
              {(Object.entries(NOTE_TYPE_CONFIG) as [NoteType, typeof NOTE_TYPE_CONFIG[NoteType]][]).map(([type, cfg]) => (
                <HStack key={type} spacing="8px">
                  <Box
                    w="8px"
                    h="8px"
                    borderRadius="2px"
                    bg={cfg.bg}
                    border={`1px solid ${cfg.border}`}
                    flexShrink={0}
                  />
                  <Text fontFamily="var(--font-sans)" fontSize="11px" color={cfg.color}>
                    {cfg.label}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        </Box>

        {/* Notes Feed */}
        <Box
          flex={1}
          minW={0}
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          {/* Feed scroll area */}
          <Box
            flex={1}
            minH={0}
            overflowY="auto"
            px="32px"
            pt="24px"
            pb="24px"
            sx={{
              '&::-webkit-scrollbar': { width: '3px' },
              '&::-webkit-scrollbar-track': { bg: 'transparent' },
              '&::-webkit-scrollbar-thumb': { bg: 'var(--mist)', borderRadius: 'full' },
            }}
          >
            {notes.length === 0 ? (
              <Box
                h="100%"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                opacity={0.5}
              >
                <Notebook size={40} strokeWidth={1} color="var(--mist)" />
                <Text
                  fontFamily="var(--font-mono)"
                  fontSize="11px"
                  letterSpacing="0.10em"
                  textTransform="uppercase"
                  color="var(--mist)"
                  mt="12px"
                >
                  Noch keine Einträge
                </Text>
                <Text
                  fontFamily="var(--font-sans)"
                  fontSize="13px"
                  color="var(--mist)"
                  mt="4px"
                >
                  Beginne mit dem Mitschreiben ↓
                </Text>
              </Box>
            ) : (
              <VStack align="stretch" spacing="8px">
                <AnimatePresence initial={false}>
                  {notes.map((note) => {
                    const cfg = NOTE_TYPE_CONFIG[note.note_type];
                    const isTemp = note.id.startsWith('temp-');
                    return (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: isTemp ? 0.6 : 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
                      >
                        <Box
                          bg={cfg.bg}
                          border="1px solid"
                          borderColor={cfg.border}
                          borderLeft={`3px solid ${cfg.border}`}
                          borderRadius="var(--radius-3)"
                          p="14px"
                        >
                          <HStack justify="space-between" mb="6px">
                            <HStack spacing="6px">
                              <Box color={cfg.color}>{NOTE_TYPE_ICONS[note.note_type]}</Box>
                              <Box
                                bg={cfg.border}
                                borderRadius="var(--radius-full)"
                                px="7px"
                                py="1px"
                                fontFamily="var(--font-sans)"
                                fontSize="10px"
                                fontWeight={600}
                                color={cfg.color}
                                letterSpacing="0.04em"
                                textTransform="uppercase"
                              >
                                {cfg.label}
                              </Box>
                            </HStack>
                            <Text
                              fontFamily="var(--font-mono)"
                              fontSize="10px"
                              color="var(--mute)"
                              letterSpacing="0.06em"
                            >
                              {isTemp ? '...' : fmtTimestamp(note.created_at)}
                            </Text>
                          </HStack>
                          <Text
                            fontFamily="var(--font-sans)"
                            fontSize="14px"
                            color="var(--ink)"
                            lineHeight={1.6}
                            whiteSpace="pre-wrap"
                          >
                            {note.content}
                          </Text>
                        </Box>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={feedEndRef} />
              </VStack>
            )}
          </Box>

          {/* Input Bar */}
          <Box
            borderTop="1px solid var(--mist)"
            bg="var(--frost)"
            px="24px"
            pt="14px"
            pb="16px"
            flexShrink={0}
          >
            {/* Type selector */}
            <HStack spacing="6px" mb="10px">
              {(Object.entries(NOTE_TYPE_CONFIG) as [NoteType, typeof NOTE_TYPE_CONFIG[NoteType]][]).map(([type, cfg]) => (
                <Box
                  key={type}
                  as="button"
                  onClick={() => setSelectedType(type)}
                  display="flex"
                  alignItems="center"
                  gap="5px"
                  px="10px"
                  py="5px"
                  borderRadius="var(--radius-full)"
                  border="1px solid"
                  borderColor={selectedType === type ? cfg.border : 'var(--mist)'}
                  bg={selectedType === type ? cfg.bg : 'transparent'}
                  color={selectedType === type ? cfg.color : 'var(--mute)'}
                  fontFamily="var(--font-sans)"
                  fontSize="11px"
                  fontWeight={selectedType === type ? 600 : 400}
                  transition="all 150ms ease"
                  _hover={{ borderColor: cfg.border, color: cfg.color }}
                >
                  <Box>{NOTE_TYPE_ICONS[type]}</Box>
                  {cfg.label}
                </Box>
              ))}
            </HStack>

            {/* Textarea + Submit */}
            <HStack spacing="10px" align="flex-end">
              <Textarea
                ref={textareaRef}
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`${NOTE_TYPE_CONFIG[selectedType].label} eingeben… (Enter zum Senden, Shift+Enter für neue Zeile)`}
                fontFamily="var(--font-sans)"
                fontSize="14px"
                color="var(--ink)"
                bg="var(--paper)"
                border="1px solid var(--mist)"
                borderRadius="var(--radius-3)"
                resize="none"
                rows={2}
                _focus={{ borderColor: 'var(--forest)', boxShadow: 'none', outline: 'none' }}
                _placeholder={{ color: 'var(--mist)', fontSize: '13px' }}
                flex={1}
                minH="52px"
                maxH="120px"
                sx={{ transition: 'border-color 150ms ease' }}
              />
              <Box
                as="button"
                onClick={handleSubmit}
                disabled={!inputContent.trim() || isSubmitting}
                w="44px"
                h="44px"
                flexShrink={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="var(--radius-3)"
                bg={inputContent.trim() ? 'var(--forest)' : 'var(--mist)'}
                color="var(--paper)"
                cursor={inputContent.trim() ? 'pointer' : 'not-allowed'}
                opacity={isSubmitting ? 0.5 : 1}
                transition="all 150ms ease"
                _hover={inputContent.trim() ? { bg: 'var(--leaf)' } : {}}
              >
                <Send size={16} strokeWidth={2} />
              </Box>
            </HStack>

            <Text
              fontFamily="var(--font-mono)"
              fontSize="10px"
              color="var(--mist)"
              mt="6px"
              letterSpacing="0.06em"
            >
              Enter senden · Shift+Enter neue Zeile · Escape schließen
            </Text>
          </Box>
        </Box>
      </Box>
    </MotionBox>
  );
}
