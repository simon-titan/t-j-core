'use client';

import { Box, Text, HStack, VStack } from '@chakra-ui/react';
import type { AnalyticsTotals } from './types';

interface Props {
  totals: AnalyticsTotals;
}

export function FunnelChart({ totals }: Props) {
  const { dms, answered, appointments, deals } = totals;

  const steps = [
    { label: 'DMs',      value: dms,          pct: 100 },
    { label: 'Antworten', value: answered,     pct: dms > 0 ? Math.round((answered / dms) * 100) : 0 },
    { label: 'Termine',   value: appointments, pct: dms > 0 ? Math.round((appointments / dms) * 100) : 0 },
    { label: 'Deals',     value: deals,        pct: dms > 0 ? Math.round((deals / dms) * 100) : 0 },
  ];

  const widths = [
    100,
    dms > 0 ? (answered      / dms) * 100 : 0,
    dms > 0 ? (appointments  / dms) * 100 : 0,
    dms > 0 ? (deals         / dms) * 100 : 0,
  ];

  return (
    <VStack spacing={2} align="stretch">
      {steps.map((step, i) => (
        <Box key={step.label}>
          <HStack justify="space-between" mb={1}>
            <Text
              fontFamily="var(--font-mono)"
              fontSize="10px"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color="var(--mute)"
            >
              {step.label}
            </Text>
            <HStack spacing={2}>
              <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--ink)" fontWeight={500}>
                {step.value}
              </Text>
              {i > 0 && (
                <Text fontFamily="var(--font-mono)" fontSize="10px" color="var(--mute)">
                  {step.pct}%
                </Text>
              )}
            </HStack>
          </HStack>
          <Box
            h="8px"
            bg="var(--mist)"
            borderRadius="var(--radius-full)"
            overflow="hidden"
          >
            <Box
              h="100%"
              w={`${widths[i]}%`}
              bg={i === 0
                ? 'var(--forest)'
                : i === 1
                ? 'var(--glow)'
                : i === 2
                ? 'var(--leaf)'
                : 'rgba(74,124,92,0.45)'}
              borderRadius="var(--radius-full)"
              transition="width 600ms cubic-bezier(0.65,0,0.35,1)"
            />
          </Box>
        </Box>
      ))}
    </VStack>
  );
}
