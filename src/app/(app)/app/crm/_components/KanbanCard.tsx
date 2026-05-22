'use client';

import { useState } from 'react';
import { Box, Text, HStack, VStack } from '@chakra-ui/react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Clock, Mail, Phone, ChevronRight, Euro } from 'lucide-react';
import type { KanbanLead, MeetingType } from './types';
import { MEETING_TYPE_LABELS, LEAD_STATUS_LABELS, getLeadDealValue, getInitials } from './types';

interface Props {
  lead: KanbanLead;
  onOpen: (lead: KanbanLead) => void;
  isOverlay?: boolean;
  bulkMode?: boolean;
  isSelected?: boolean;
  onSelect?: (leadId: string, selected: boolean) => void;
}

const ACCENT: Record<MeetingType, { border: string; badge: string; text: string }> = {
  discovery: { border: 'var(--leaf)', badge: 'rgba(74,124,92,0.10)', text: 'var(--forest)' },
  demo: { border: 'var(--forest)', badge: 'rgba(74,124,92,0.16)', text: 'var(--forest)' },
  proposal: { border: '#D97706', badge: 'rgba(234,179,8,0.10)', text: '#854D0E' },
  closing: { border: 'var(--glow)', badge: 'rgba(74,124,92,0.22)', text: 'var(--glow)' },
  follow_up: { border: 'var(--mist)', badge: 'var(--frost)', text: 'var(--mute)' },
  other: { border: 'var(--mist)', badge: 'var(--frost)', text: 'var(--mute)' },
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  new:         { bg: 'var(--frost)',             color: 'var(--mute)' },
  contacted:   { bg: 'rgba(74,124,92,0.07)',      color: 'var(--forest)' },
  qualified:   { bg: 'rgba(74,124,92,0.12)',      color: 'var(--forest)' },
  proposal:    { bg: 'rgba(234,179,8,0.10)',      color: '#854D0E' },
  negotiating: { bg: 'rgba(74,124,92,0.18)',      color: 'var(--forest)' },
  won:         { bg: 'rgba(34,197,94,0.10)',      color: '#166534' },
  lost:        { bg: 'rgba(239,68,68,0.08)',      color: '#991B1B' },
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const tom = new Date(now);
  tom.setDate(now.getDate() + 1);
  const time = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === now.toDateString()) return `Heute ${time}`;
  if (d.toDateString() === tom.toDateString()) return `Morgen ${time}`;
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }) + ` ${time}`;
}

export function KanbanCard({
  lead,
  onOpen,
  isOverlay = false,
  bulkMode = false,
  isSelected = false,
  onSelect,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  });

  const style = { transform: CSS.Translate.toString(transform) };
  const prospect = lead.prospect;
  const fullName = `${prospect.first_name} ${prospect.last_name}`;
  const initials = getInitials(prospect.first_name, prospect.last_name);
  const dealValue = getLeadDealValue(lead);
  const accent = lead.latestMeetingType ? ACCENT[lead.latestMeetingType] : null;
  const isHeuteFällig = lead.column === 'heute_fällig';
  const isRejected = lead.column === 'rejected';
  const showActions = hovered && !isDragging && !bulkMode && !isOverlay;
  const showCheckbox = bulkMode || (hovered && !isDragging && !isOverlay);
  const statusStyle = STATUS_STYLE[lead.status] ?? STATUS_STYLE.new;

  const borderLeftColor = accent?.border ?? (isHeuteFällig ? 'var(--forest)' : isRejected ? '#EF4444' : 'var(--mist)');

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      position="relative"
      bg={isSelected ? 'rgba(74,124,92,0.04)' : 'var(--paper)'}
      border="1px solid"
      borderColor={
        isSelected
          ? 'rgba(74,124,92,0.35)'
          : isHeuteFällig
          ? 'rgba(74,124,92,0.22)'
          : isRejected
          ? 'rgba(239,68,68,0.15)'
          : 'var(--mist)'
      }
      borderLeft={`3px solid ${borderLeftColor}`}
      borderRadius="var(--radius-3)"
      overflow="hidden"
      cursor={isDragging ? 'grabbing' : 'grab'}
      boxShadow={isDragging || isOverlay ? 'var(--shadow-4)' : hovered ? 'var(--shadow-2)' : 'var(--shadow-1)'}
      transform={isOverlay ? 'scale(1.02) rotate(1.5deg)' : undefined}
      opacity={isDragging && !isOverlay ? 0.4 : 1}
      transition="box-shadow 180ms ease, border-color 180ms ease, background 180ms ease"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !bulkMode && onOpen(lead)}
      role={bulkMode ? 'checkbox' : 'button'}
      aria-checked={bulkMode ? isSelected : undefined}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          bulkMode ? onSelect?.(lead.id, !isSelected) : onOpen(lead);
        }
      }}
    >
      {/* Main content */}
      <Box p="16px" pb="14px">
        {/* Row 1: Avatar/Checkbox + Name + Badge */}
        <HStack spacing="12px" align="flex-start" mb="12px">
          {/* Avatar or Checkbox */}
          {showCheckbox ? (
            <Box
              flexShrink={0}
              w="34px"
              h="34px"
              borderRadius="var(--radius-2)"
              border="1.5px solid"
              borderColor={isSelected ? 'var(--forest)' : 'var(--mist)'}
              bg={isSelected ? 'var(--forest)' : 'var(--paper)'}
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              transition="all 150ms ease"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onSelect?.(lead.id, !isSelected);
              }}
            >
              {isSelected && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6L5 9L10 3"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </Box>
          ) : (
            <Box
              flexShrink={0}
              w="34px"
              h="34px"
              borderRadius="var(--radius-full)"
              bg={isRejected ? 'rgba(239,68,68,0.12)' : 'var(--forest)'}
              border={isRejected ? '1.5px solid rgba(239,68,68,0.25)' : 'none'}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text
                fontFamily="var(--font-sans)"
                fontSize="12px"
                fontWeight={700}
                color={isRejected ? '#991B1B' : 'var(--paper)'}
                lineHeight={1}
                letterSpacing="0.02em"
              >
                {initials}
              </Text>
            </Box>
          )}

          {/* Name + Company + Position */}
          <VStack align="flex-start" spacing="2px" flex={1} minW={0}>
            <Text
              fontFamily="var(--font-sans)"
              fontSize="14px"
              fontWeight={700}
              color="var(--ink)"
              lineHeight={1.2}
              noOfLines={1}
            >
              {fullName}
            </Text>
            {(prospect.company || prospect.industry) && (
              <Text
                fontFamily="var(--font-sans)"
                fontSize="12px"
                color="var(--mute)"
                noOfLines={1}
              >
                {[prospect.company, prospect.industry].filter(Boolean).join(' · ')}
              </Text>
            )}
            {prospect.position && (
              <Text
                fontFamily="var(--font-sans)"
                fontSize="11px"
                color="var(--mist)"
                noOfLines={1}
                fontStyle="italic"
              >
                {prospect.position}
              </Text>
            )}
          </VStack>
        </HStack>

        {/* Row 2: Meeting type + Deal value + Status */}
        <HStack spacing="6px" mb="12px" flexWrap="wrap">
          {lead.latestMeetingType && accent && (
            <Box
              bg={accent.badge}
              color={accent.text}
              borderRadius="var(--radius-full)"
              px="9px"
              py="3px"
              fontFamily="var(--font-sans)"
              fontSize="11px"
              fontWeight={600}
              letterSpacing="0.04em"
              textTransform="uppercase"
            >
              {MEETING_TYPE_LABELS[lead.latestMeetingType]}
            </Box>
          )}
          <Box
            bg={statusStyle.bg}
            color={statusStyle.color}
            borderRadius="var(--radius-full)"
            px="9px"
            py="3px"
            fontFamily="var(--font-sans)"
            fontSize="11px"
            fontWeight={500}
            letterSpacing="0.03em"
          >
            {LEAD_STATUS_LABELS[lead.status]}
          </Box>
          {dealValue > 0 && (
            <HStack
              spacing="3px"
              bg="rgba(74,124,92,0.08)"
              borderRadius="var(--radius-full)"
              px="9px"
              py="3px"
            >
              <Euro size={10} color="var(--forest)" />
              <Text
                fontFamily="var(--font-mono)"
                fontSize="12px"
                fontWeight={700}
                color="var(--forest)"
              >
                {dealValue >= 1000
                  ? `${(dealValue / 1000).toFixed(dealValue % 1000 === 0 ? 0 : 1)}k`
                  : dealValue.toLocaleString('de-DE')}
              </Text>
            </HStack>
          )}
        </HStack>

        {/* Divider */}
        <Box h="1px" bg="var(--mist)" style={{ marginLeft: '-16px', marginRight: '-16px' }} mb="12px" />

        {/* Row 3: Appointment + Phone + Days */}
        <VStack align="stretch" spacing="7px">
          {lead.nextAppointment && (
            <HStack spacing="8px">
              <Calendar size={12} strokeWidth={1.5} color="var(--mute)" style={{ flexShrink: 0 }} />
              <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--ink)" noOfLines={1}>
                {fmtDate(lead.nextAppointment.scheduled_at)}
              </Text>
            </HStack>
          )}
          {prospect.phone && (
            <HStack spacing="8px">
              <Phone size={12} strokeWidth={1.5} color="var(--mute)" style={{ flexShrink: 0 }} />
              <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--mute)" noOfLines={1}>
                {prospect.phone}
              </Text>
            </HStack>
          )}
          <HStack spacing="8px">
            <Clock size={12} strokeWidth={1.5} color="var(--mute)" style={{ flexShrink: 0 }} />
            <Text fontFamily="var(--font-mono)" fontSize="11px" color="var(--mute)">
              {lead.daysSinceLastContact === 0
                ? 'Heute'
                : `${lead.daysSinceLastContact}d seit Kontakt`}
            </Text>
          </HStack>
        </VStack>
      </Box>

      {/* Quick Actions (hover, non-bulk, non-overlay) */}
      {showActions && (
        <Box
          borderTop="1px solid"
          borderTopColor="var(--mist)"
          px="16px"
          py="8px"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          bg="var(--frost)"
        >
          <HStack spacing="4px">
            {prospect.email && (
              <Box
                as="a"
                href={`mailto:${prospect.email}`}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                display="flex"
                alignItems="center"
                justifyContent="center"
                w="28px"
                h="28px"
                borderRadius="var(--radius-2)"
                color="var(--mute)"
                _hover={{ bg: 'var(--mist)', color: 'var(--forest)' }}
                transition="all 120ms ease"
                title={prospect.email}
              >
                <Mail size={13} strokeWidth={1.5} />
              </Box>
            )}
            {prospect.phone && (
              <Box
                as="a"
                href={`tel:${prospect.phone}`}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                display="flex"
                alignItems="center"
                justifyContent="center"
                w="28px"
                h="28px"
                borderRadius="var(--radius-2)"
                color="var(--mute)"
                _hover={{ bg: 'var(--mist)', color: 'var(--forest)' }}
                transition="all 120ms ease"
                title={prospect.phone}
              >
                <Phone size={13} strokeWidth={1.5} />
              </Box>
            )}
          </HStack>

          <HStack
            spacing="3px"
            px="9px"
            py="4px"
            borderRadius="var(--radius-2)"
            cursor="pointer"
            color="var(--mute)"
            _hover={{ bg: 'var(--mist)', color: 'var(--ink)' }}
            transition="all 120ms ease"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onOpen(lead);
            }}
          >
            <Text fontFamily="var(--font-sans)" fontSize="12px" fontWeight={500}>
              Detail
            </Text>
            <ChevronRight size={12} strokeWidth={2} />
          </HStack>
        </Box>
      )}
    </Box>
  );
}
