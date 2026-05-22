'use client';

import { Box, HStack, VStack, Text, Button } from '@chakra-ui/react';
import { CheckCheck, SkipForward } from 'lucide-react';
import type { PendingFollowup, Urgency } from './types';
import { getDateParts, getUrgency } from './types';

interface Props {
  followup:  PendingFollowup;
  onSent:    (id: string) => void;
  onSkip:    (id: string) => void;
  isLoading: boolean;
}

const urgencyAccent: Record<Urgency, string> = {
  overdue: 'var(--error)',
  today:   'var(--warning)',
  soon:    'var(--leaf)',
  future:  'var(--mute)',
};

export function FollowUpCard({ followup, onSent, onSkip, isLoading }: Props) {
  const urgency = getUrgency(followup.scheduled_for);
  const { day, month } = getDateParts(followup.scheduled_for);
  const prospect = followup.pitches?.prospects;
  const templateName = followup.pitches?.pitch_templates?.name ?? null;
  const accentColor = urgencyAccent[urgency];

  const fullName = prospect
    ? `${prospect.first_name} ${prospect.last_name}`
    : 'Unbekannt';

  return (
    <Box
      bg="rgba(248,248,250,0.85)"
      backdropFilter="blur(12px) saturate(1.4)"
      border="1px solid rgba(14,14,12,0.08)"
      borderLeft="3px solid"
      borderLeftColor={accentColor}
      borderRadius="var(--radius-4)"
      p={4}
      boxShadow="var(--shadow-cool-1)"
      transition="box-shadow 160ms var(--ease-default)"
      _hover={{ boxShadow: 'var(--shadow-cool-2)' }}
    >
      <HStack spacing={4} align="flex-start">
        {/* Date Badge */}
        <Box
          minW="52px"
          h="62px"
          background="var(--gradient-leaf-glow)"
          borderRadius="var(--radius-3)"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          boxShadow="0 2px 8px rgba(74,124,92,0.25)"
        >
          <Text
            fontFamily="var(--font-display)"
            fontStyle="italic"
            fontSize="28px"
            lineHeight={1}
            letterSpacing="-0.02em"
            color="var(--paper)"
          >
            {day}
          </Text>
          <Text
            fontFamily="var(--font-mono)"
            fontSize="9px"
            letterSpacing="0.12em"
            textTransform="uppercase"
            color="rgba(252,252,253,0.80)"
            mt="2px"
          >
            {month}
          </Text>
        </Box>

        {/* Content */}
        <VStack align="flex-start" spacing={1} flex={1} minW={0}>
          <Text
            fontFamily="var(--font-sans)"
            fontSize="14px"
            fontWeight={500}
            color="var(--ink)"
            lineHeight={1.3}
          >
            {fullName}
          </Text>
          {templateName && (
            <Text
              fontFamily="var(--font-sans)"
              fontSize="13px"
              color="var(--mute)"
              lineHeight={1.3}
              noOfLines={1}
            >
              {templateName}
            </Text>
          )}
          <Text
            fontFamily="var(--font-mono)"
            fontSize="11px"
            letterSpacing="0.06em"
            color={accentColor}
          >
            Stufe {followup.level} · Follow-Up
          </Text>

          {/* Actions */}
          <HStack spacing={2} mt={2}>
            <Button
              size="sm"
              h="30px"
              px={3}
              fontFamily="var(--font-sans)"
              fontSize="12px"
              fontWeight={500}
              bg="var(--forest)"
              color="var(--paper)"
              border="1px solid var(--forest)"
              borderRadius="var(--radius-2)"
              leftIcon={<CheckCheck size={13} strokeWidth={2} />}
              _hover={{ bg: 'var(--forest-deep)' }}
              onClick={() => onSent(followup.id)}
              isLoading={isLoading}
              isDisabled={isLoading}
            >
              Als gesendet
            </Button>
            <Button
              size="sm"
              h="30px"
              px={3}
              fontFamily="var(--font-sans)"
              fontSize="12px"
              fontWeight={400}
              variant="ghost"
              color="var(--mute)"
              borderRadius="var(--radius-2)"
              leftIcon={<SkipForward size={13} strokeWidth={2} />}
              _hover={{ color: 'var(--ink)', bg: 'var(--ink-04)' }}
              onClick={() => onSkip(followup.id)}
              isDisabled={isLoading}
            >
              Überspringen
            </Button>
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
}
