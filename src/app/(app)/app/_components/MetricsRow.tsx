'use client';

import { Box, Grid, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Percent,
  Clock,
  Calendar,
  Trophy,
} from 'lucide-react';
import type { DashboardMetrics } from './types';

const MotionBox = motion(Box);

const ICON_BGS = [
  'rgba(45,84,67,0.10)',
  'rgba(74,124,92,0.10)',
  'rgba(45,84,67,0.08)',
  'rgba(74,124,92,0.08)',
  'rgba(45,84,67,0.12)',
];

interface MetricCardProps {
  label:  string;
  value:  string;
  sub:    string;
  icon:   React.ElementType;
  iconBg: string;
  index:  number;
}

function MetricCard({ label, value, sub, icon: Icon, iconBg, index }: MetricCardProps) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1], delay: index * 0.07 } as never}
      bg="rgba(248,248,250,0.85)"
      backdropFilter="blur(12px) saturate(1.4)"
      border="1px solid rgba(14,14,12,0.08)"
      borderRadius="var(--radius-5)"
      p={6}
      boxShadow="var(--shadow-cool-2)"
      position="relative"
      overflow="hidden"
      sx={{ transition: 'all 180ms var(--ease-default)' }}
      _hover={{ boxShadow: 'var(--shadow-cool-3)', transform: 'translateY(-1px)' }}
    >
      {/* Forest corner arc */}
      <Box
        position="absolute"
        top={0}
        right={0}
        w="64px"
        h="64px"
        bg={iconBg}
        borderRadius="0 var(--radius-5) 0 64px"
        opacity={0.7}
      />

      <Box display="flex" flexDirection="column" gap="12px" position="relative">
        <Box
          w="32px"
          h="32px"
          bg={iconBg}
          border="1px solid rgba(45,84,67,0.12)"
          borderRadius="var(--radius-2)"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon size={15} strokeWidth={2} color="var(--forest)" />
        </Box>

        <Box>
          <Text
            fontFamily="var(--font-display)"
            fontSize="38px"
            fontStyle="italic"
            lineHeight={1}
            letterSpacing="-0.025em"
            color="var(--ink)"
          >
            {value}
          </Text>
          <Text
            fontFamily="var(--font-mono)"
            fontSize="9px"
            letterSpacing="0.12em"
            textTransform="uppercase"
            color="var(--mute)"
            mt={1}
          >
            {label}
          </Text>
          <Text fontSize="11px" color="rgba(14,14,12,0.40)" mt="2px">
            {sub}
          </Text>
        </Box>
      </Box>
    </MotionBox>
  );
}

interface Props {
  metrics: DashboardMetrics;
}

export function MetricsRow({ metrics }: Props) {
  const cards: Omit<MetricCardProps, 'index'>[] = [
    {
      label:  'DMs diese Woche',
      value:  String(metrics.dmsThisWeek),
      sub:    'Gesendete Pitches',
      icon:   MessageSquare,
      iconBg: ICON_BGS[0],
    },
    {
      label:  'Antwortrate',
      value:  `${metrics.answerRate}%`,
      sub:    'Pitches mit Antwort',
      icon:   Percent,
      iconBg: ICON_BGS[1],
    },
    {
      label:  'Follow-Ups heute',
      value:  String(metrics.followupsToday),
      sub:    'Offen & fällig',
      icon:   Clock,
      iconBg: ICON_BGS[2],
    },
    {
      label:  'Termine diese Woche',
      value:  String(metrics.appointmentsThisWeek),
      sub:    'Geplant & stattgefunden',
      icon:   Calendar,
      iconBg: ICON_BGS[3],
    },
    {
      label:  'Geclosed',
      value:  String(metrics.totalClosed),
      sub:    'Deals gesamt gewonnen',
      icon:   Trophy,
      iconBg: ICON_BGS[4],
    },
  ];

  return (
    <Grid
      templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }}
      gap={4}
    >
      {cards.map((card, i) => (
        <MetricCard key={card.label} {...card} index={i} />
      ))}
    </Grid>
  );
}
