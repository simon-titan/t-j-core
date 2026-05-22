'use client';

import { Box, Text, HStack, SimpleGrid } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { PitchWithRelations, PendingFollowup, TimeRange } from './types';
import { filterByTimeRange } from './types';

const MotionBox = motion(Box);

const fadeInUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.65, 0, 0.35, 1], delay: i * 0.08 },
  }),
};

interface Props {
  pitches:        PitchWithRelations[];
  followups:      PendingFollowup[];
  timeRange:      TimeRange;
  onTimeRange:    (r: TimeRange) => void;
}

const TIME_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: '7d',  value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
  { label: 'Alle', value: 'all' },
];

export function KPIBar({ pitches, followups, timeRange, onTimeRange }: Props) {
  const filtered    = filterByTimeRange(pitches, timeRange);
  const total       = filtered.length;
  const answered    = filtered.filter(p => p.status === 'answered').length;
  const withAppt    = filtered.filter(p => p.leads?.[0]?.appointments?.length > 0).length;
  const pendingFups = followups.filter(f => f.status === 'pending').length;

  const answerRate  = total > 0 ? Math.round((answered / total) * 100) : 0;
  const apptRate    = total > 0 ? Math.round((withAppt / total) * 100) : 0;

  const widgets = [
    { label: 'Gesamt DMs',      value: total.toString(),       unit: '' },
    { label: 'Antwortrate',     value: answerRate.toString(),  unit: ' %' },
    { label: 'Terminrate',      value: apptRate.toString(),    unit: ' %' },
    { label: 'Offene FUPs',     value: pendingFups.toString(), unit: '' },
  ];

  return (
    <Box mb={7}>
      {/* Zeitraum-Filter */}
      <HStack spacing={1} mb={4} justify="flex-end">
        {TIME_OPTIONS.map(opt => (
          <Box
            as="button"
            key={opt.value}
            onClick={() => onTimeRange(opt.value)}
            px={3}
            py="5px"
            borderRadius="var(--radius-full)"
            fontFamily="var(--font-sans)"
            fontSize="13px"
            fontWeight={timeRange === opt.value ? 500 : 400}
            bg={timeRange === opt.value ? 'var(--forest)' : 'transparent'}
            color={timeRange === opt.value ? 'var(--paper)' : 'var(--mute)'}
            border="1px solid"
            borderColor={timeRange === opt.value ? 'var(--forest)' : 'var(--mist)'}
            cursor="pointer"
            transition="all 120ms var(--ease-default)"
            _hover={
              timeRange !== opt.value
                ? { bg: 'var(--ink-04)', color: 'var(--ink)' }
                : {}
            }
          >
            {opt.label}
          </Box>
        ))}
      </HStack>

      {/* Widget Cards */}
      <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4}>
        {widgets.map((w, i) => (
          <MotionBox
            key={w.label}
            custom={i}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            bg="rgba(248,248,250,0.85)"
            backdropFilter="blur(12px) saturate(1.4)"
            border="1px solid rgba(14,14,12,0.08)"
            borderRadius="var(--radius-5)"
            p={6}
            boxShadow="var(--shadow-cool-2)"
          >
            <Text
              fontFamily="var(--font-mono)"
              fontSize="10px"
              letterSpacing="0.10em"
              textTransform="uppercase"
              color="var(--mute)"
              mb={2}
            >
              {w.label}
            </Text>
            <Text
              fontFamily="var(--font-display)"
              fontSize="36px"
              fontStyle="italic"
              lineHeight={1.1}
              letterSpacing="-0.02em"
              color="var(--ink)"
            >
              {w.value}
              {w.unit && (
                <Text as="span" fontSize="20px" color="var(--mute)">
                  {w.unit}
                </Text>
              )}
            </Text>
          </MotionBox>
        ))}
      </SimpleGrid>
    </Box>
  );
}
