'use client';

import {
  Box, HStack, Text, Switch, Tooltip, Menu, MenuButton,
  MenuList, MenuItem, IconButton, Divider,
} from '@chakra-ui/react';
import { MoreHorizontal, Calendar, Trash2, FileEdit } from 'lucide-react';
import type { PitchWithRelations, FollowupSlot, FollowupStatus } from './types';
import { formatDateShort, formatDateFull, getUrgency } from './types';

interface Props {
  pitch:       PitchWithRelations;
  onAnswer:    (id: string, checked: boolean) => void;
  onDelete:    (id: string) => void;
  onEditNotes: (id: string, notes: string) => void;
  isUpdating:  boolean;
  showSentBy?: boolean;
}

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  sent:      { label: 'Gesendet',       bg: 'var(--frost)',        color: 'var(--mute)' },
  delivered: { label: 'Zugestellt',     bg: 'rgba(74,124,92,0.1)', color: 'var(--leaf)' },
  answered:  { label: 'Geantwortet',    bg: 'rgba(74,124,92,0.15)',color: 'var(--forest)' },
  ignored:   { label: 'Ignoriert',      bg: 'rgba(14,14,12,0.06)', color: 'var(--mute)' },
  bounced:   { label: 'Fehlgeschlagen', bg: 'rgba(153,27,27,0.08)','color': '#991B1B' },
};

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

export function PitchRow({ pitch, onAnswer, onDelete, onEditNotes, isUpdating, showSentBy }: Props) {
  const prospect = pitch.prospects;
  const template = pitch.pitch_templates;
  const appt     = pitch.leads?.[0]?.appointments?.[0] ?? null;
  const badge    = STATUS_BADGE[pitch.status] ?? STATUS_BADGE.sent;

  const fullName = prospect
    ? `${prospect.first_name} ${prospect.last_name}`
    : '—';

  const slots: FollowupSlot[] = pitch.followups.slice(0, 3);
  // Pad to 3 slots visually if fewer exist
  const padded: (FollowupSlot | null)[] = [
    slots[0] ?? null,
    slots[1] ?? null,
    slots[2] ?? null,
  ];

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

      {/* Termin Chip */}
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
              cursor="default"
            >
              <Calendar size={11} strokeWidth={2} color="var(--paper)" />
              <Text fontFamily="var(--font-sans)" fontSize="11px" color="var(--paper)" fontWeight={500}>
                {formatDateShort(appt.scheduled_at)}
              </Text>
            </HStack>
          </Tooltip>
        ) : (
          <Text fontFamily="var(--font-sans)" fontSize="11px" color="var(--mist)">—</Text>
        )}
      </Box>

      {/* Notizen */}
      <Box minW={0} pr={2}>
        {pitch.notes ? (
          <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--mute)" noOfLines={1}>
            {pitch.notes}
          </Text>
        ) : (
          <Text fontFamily="var(--font-sans)" fontSize="11px" color="var(--mist)">—</Text>
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
            icon={<FileEdit size={13} strokeWidth={2} />}
            color="var(--ink)"
            _hover={{ bg: 'var(--frost)' }}
            onClick={() => onEditNotes(pitch.id, pitch.notes ?? '')}
          >
            Notizen bearbeiten
          </MenuItem>
          <Divider my={1} borderColor="var(--mist)" />
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
