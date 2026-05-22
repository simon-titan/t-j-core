'use client';

import { useRef, useState } from 'react';
import {
  Box, HStack, Text, Switch, Tooltip, Menu, MenuButton,
  MenuList, MenuItem, IconButton, Input,
} from '@chakra-ui/react';
import { MoreHorizontal, Calendar, CalendarPlus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { t } from '@/lib/toast';
import type { PitchWithRelations, FollowupSlot, FollowupStatus } from './types';
import { formatDateShort, formatDateFull, getUrgency } from './types';

interface Props {
  pitch:                  PitchWithRelations;
  onAnswer:               (id: string, checked: boolean) => void;
  onDelete:               (id: string) => void;
  onScheduleAppointment:  (pitchId: string) => void;
  onNotesUpdated:         (id: string, notes: string | null) => void;
  isUpdating:             boolean;
  showSentBy?:            boolean;
}


const DOT_COLOR: Record<FollowupStatus, string> = {
  pending: 'var(--mist)',
  sent:    'var(--leaf)',
  skipped: 'rgba(14,14,12,0.20)',
};

function FollowupDot({ slot }: { slot: FollowupSlot }) {
  const isDue = slot.status === 'pending' && getUrgency(slot.scheduled_for) !== 'future';
  return (
    <Tooltip
      label={`Stufe ${slot.level} · ${slot.status === 'sent' ? 'Gesendet' : slot.status === 'skipped' ? 'Übersprungen' : 'Ausstehend'}`}
      placement="top"
      hasArrow
      fontFamily="var(--font-sans)"
      fontSize="11px"
    >
      <Box
        w="8px"
        h="8px"
        borderRadius="full"
        bg={DOT_COLOR[slot.status]}
        border="1px solid"
        borderColor={slot.status === 'pending' ? 'rgba(14,14,12,0.15)' : 'transparent'}
        className={isDue ? 'dot-pulse' : undefined}
        flexShrink={0}
      />
    </Tooltip>
  );
}

export function PitchRow({
  pitch,
  onAnswer,
  onDelete,
  onScheduleAppointment,
  onNotesUpdated,
  isUpdating,
  showSentBy,
}: Props) {
  const prospect    = pitch.prospects;
  const template    = pitch.pitch_templates;
  const appt        = pitch.leads?.[0]?.appointments?.[0] ?? null;
  const hasLead     = !!pitch.leads?.[0];

  const fullName = prospect
    ? `${prospect.first_name} ${prospect.last_name}`.trim()
    : '—';

  const slots: FollowupSlot[] = pitch.followups.slice(0, 3);
  const padded: (FollowupSlot | null)[] = [
    slots[0] ?? null,
    slots[1] ?? null,
    slots[2] ?? null,
  ];

  // ── Inline notes editing ───────────────────────────────────────────────────
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft]         = useState('');
  const [savingNotes, setSavingNotes]       = useState(false);
  const notesInputRef                       = useRef<HTMLInputElement>(null);
  const supabase                            = createClient();

  function startEditNotes() {
    setNotesDraft(pitch.notes ?? '');
    setIsEditingNotes(true);
    // Focus after state update
    setTimeout(() => notesInputRef.current?.focus(), 0);
  }

  async function commitNotes() {
    if (savingNotes) return;
    setSavingNotes(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('pitches') as any)
      .update({ notes: notesDraft.trim() || null })
      .eq('id', pitch.id);
    setSavingNotes(false);
    setIsEditingNotes(false);
    if (error) {
      t.error('Notizen konnten nicht gespeichert werden');
    } else {
      onNotesUpdated(pitch.id, notesDraft.trim() || null);
    }
  }

  function cancelNotes() {
    setIsEditingNotes(false);
  }

  function handleNotesKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); commitNotes(); }
    if (e.key === 'Escape') { cancelNotes(); }
  }

  return (
    <Box
      display="grid"
      gridTemplateColumns="80px 1fr 120px 80px 100px 90px minmax(0,1fr) 40px"
      alignItems="center"
      px={3}
      py={0}
      h="52px"
      borderBottom="1px solid var(--mist)"
      transition="background 120ms var(--ease-default)"
      _hover={{ bg: 'rgba(14,14,12,0.02)' }}
    >
      {/* Datum */}
      <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--mute)">
        {formatDateShort(pitch.sent_at)}
      </Text>

      {/* Name */}
      <Box minW={0} pr={3}>
        <Text
          fontFamily="var(--font-sans)"
          fontSize="13px"
          fontWeight={500}
          color="var(--ink)"
          noOfLines={1}
        >
          {fullName}
        </Text>
        {prospect?.company && (
          <Text fontFamily="var(--font-sans)" fontSize="11px" color="var(--mute)" noOfLines={1}>
            {prospect.company}
          </Text>
        )}
      </Box>

      {/* Template Badge / Gesendet von */}
      <Box pr={2}>
        {showSentBy ? (
          pitch.sender?.full_name ? (
            <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--mute)" noOfLines={1}>
              {pitch.sender.full_name}
            </Text>
          ) : (
            <Text fontFamily="var(--font-sans)" fontSize="11px" color="var(--mist)">—</Text>
          )
        ) : template ? (
          <Box
            display="inline-flex"
            px={2}
            py="2px"
            bg="rgba(14,14,12,0.05)"
            borderRadius="var(--radius-1)"
            maxW="full"
          >
            <Text fontFamily="var(--font-sans)" fontSize="11px" color="var(--mute)" noOfLines={1}>
              {template.name}
            </Text>
          </Box>
        ) : (
          <Text fontFamily="var(--font-sans)" fontSize="11px" color="var(--mist)">—</Text>
        )}
      </Box>

      {/* Follow-Up Dots */}
      <HStack spacing={2}>
        {padded.map((slot, i) =>
          slot ? (
            <FollowupDot key={slot.id} slot={slot} />
          ) : (
            <Box
              key={i}
              w="8px"
              h="8px"
              borderRadius="full"
              bg="transparent"
              border="1px dashed"
              borderColor="var(--mist)"
              flexShrink={0}
            />
          )
        )}
      </HStack>

      {/* Beantwortet Switch */}
      <Box>
        <Switch
          isChecked={pitch.status === 'answered'}
          onChange={e => onAnswer(pitch.id, e.target.checked)}
          isDisabled={isUpdating}
          colorScheme="brand"
          size="sm"
        />
      </Box>

      {/* Termin */}
      <Box>
        {appt ? (
          <Tooltip
            label={`${formatDateFull(appt.scheduled_at)} · ${appt.status}`}
            placement="top"
            hasArrow
            fontFamily="var(--font-sans)"
            fontSize="11px"
          >
            <HStack
              display="inline-flex"
              spacing={1}
              px={2}
              py="3px"
              bg="var(--forest)"
              borderRadius="var(--radius-full)"
              cursor="pointer"
              onClick={() => onScheduleAppointment(pitch.id)}
            >
              <Calendar size={11} strokeWidth={2} color="var(--paper)" />
              <Text fontFamily="var(--font-sans)" fontSize="11px" color="var(--paper)" fontWeight={500}>
                {formatDateShort(appt.scheduled_at)}
              </Text>
            </HStack>
          </Tooltip>
        ) : hasLead ? (
          <Tooltip label="Termin eintragen" placement="top" hasArrow fontFamily="var(--font-sans)" fontSize="11px">
            <Box
              as="button"
              onClick={() => onScheduleAppointment(pitch.id)}
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              w="28px"
              h="24px"
              borderRadius="var(--radius-2)"
              border="1px dashed"
              borderColor="rgba(74,124,92,0.4)"
              color="var(--forest)"
              bg="transparent"
              cursor="pointer"
              transition="all 120ms"
              _hover={{ bg: 'rgba(74,124,92,0.08)', borderColor: 'var(--forest)' }}
            >
              <CalendarPlus size={13} strokeWidth={1.8} />
            </Box>
          </Tooltip>
        ) : (
          <Tooltip label="Erst als beantwortet markieren" placement="top" hasArrow fontFamily="var(--font-sans)" fontSize="11px">
            <Box
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              w="28px"
              h="24px"
              borderRadius="var(--radius-2)"
              border="1px dashed"
              borderColor="var(--mist)"
              color="var(--mist)"
              cursor="not-allowed"
              opacity={0.5}
            >
              <CalendarPlus size={13} strokeWidth={1.8} />
            </Box>
          </Tooltip>
        )}
      </Box>

      {/* Notizen — inline editierbar */}
      <Box
        minW={0}
        pr={2}
        cursor={isEditingNotes ? 'text' : 'pointer'}
        onClick={!isEditingNotes ? startEditNotes : undefined}
        h="100%"
        display="flex"
        alignItems="center"
      >
        {isEditingNotes ? (
          <Input
            ref={notesInputRef}
            value={notesDraft}
            onChange={e => setNotesDraft(e.target.value)}
            onBlur={commitNotes}
            onKeyDown={handleNotesKeyDown}
            size="xs"
            fontFamily="var(--font-sans)"
            fontSize="12px"
            h="28px"
            px={2}
            bg="var(--paper)"
            border="1px solid var(--leaf)"
            borderRadius="var(--radius-1)"
            boxShadow="0 0 0 2px rgba(74,124,92,0.12)"
            color="var(--ink)"
            _focus={{ outline: 'none' }}
            placeholder="Notizen…"
            isDisabled={savingNotes}
          />
        ) : pitch.notes ? (
          <Text
            fontFamily="var(--font-sans)"
            fontSize="12px"
            color="var(--mute)"
            noOfLines={1}
            _hover={{ color: 'var(--ink)' }}
            transition="color 120ms"
          >
            {pitch.notes}
          </Text>
        ) : (
          <Text
            fontFamily="var(--font-sans)"
            fontSize="11px"
            color="var(--mist)"
            _hover={{ color: 'var(--mute)' }}
            transition="color 120ms"
          >
            — klicken zum Bearbeiten
          </Text>
        )}
      </Box>

      {/* Aktionen Menu */}
      <Menu placement="bottom-end">
        <MenuButton
          as={IconButton}
          aria-label="Aktionen"
          icon={<MoreHorizontal size={15} strokeWidth={2} />}
          variant="ghost"
          size="xs"
          color="var(--mute)"
          _hover={{ color: 'var(--ink)', bg: 'var(--ink-04)' }}
        />
        <MenuList
          minW="160px"
          bg="var(--paper)"
          border="1px solid var(--mist)"
          borderRadius="var(--radius-3)"
          boxShadow="var(--shadow-cool-3)"
          py={1}
          fontFamily="var(--font-sans)"
          fontSize="13px"
        >
          <MenuItem
            icon={<Trash2 size={13} strokeWidth={2} />}
            color="#991B1B"
            _hover={{ bg: 'rgba(153,27,27,0.06)' }}
            onClick={() => onDelete(pitch.id)}
          >
            Pitch löschen
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
}
