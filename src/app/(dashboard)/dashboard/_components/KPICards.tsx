'use client';

import { SimpleGrid, Box, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { AnalyticsTotals } from './types';

const MotionBox = motion(Box);

const fadeInUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.65, 0, 0.35, 1], delay: i * 0.07 },
  }),
};

function formatEur(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)     return `${(value / 1_000).toFixed(1)}k`;
  return value.toString();
}

interface Props {
  totals: AnalyticsTotals;
}

export function KPICards({ totals }: Props) {
  const { dms, answered, appointments, deals, dealValue } = totals;

  const answerRate = dms > 0 ? Math.round((answered / dms) * 100) : 0;
  const apptRate   = dms > 0 ? Math.round((appointments / dms) * 100) : 0;

  const cards = [
    { label: 'Gesamt DMs',   value: dms.toString(),            unit: '' },
    { label: 'Antwortrate',  value: answerRate.toString(),     unit: ' %' },
    { label: 'Terminrate',   value: apptRate.toString(),       unit: ' %' },
    { label: 'Deals (Won)',  value: deals.toString(),          unit: '' },
    { label: 'Deal-Wert',    value: `€ ${formatEur(dealValue)}`, unit: '' },
  ];

  return (
    <SimpleGrid columns={{ base: 2, lg: 5 }} spacing={4}>
      {cards.map((card, i) => (
        <MotionBox
          key={card.label}
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
            {card.label}
          </Text>
          <Text
            fontFamily="var(--font-display)"
            fontSize="36px"
            fontStyle="italic"
            lineHeight={1.1}
            letterSpacing="-0.02em"
            color="var(--ink)"
          >
            {card.value}
            {card.unit && (
              <Text as="span" fontSize="20px" color="var(--mute)">
                {card.unit}
              </Text>
            )}
          </Text>
        </MotionBox>
      ))}
    </SimpleGrid>
  );
}
