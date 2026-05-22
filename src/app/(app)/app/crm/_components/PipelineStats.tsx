'use client';

import { useMemo } from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import type { KanbanLead } from './types';
import { getLeadDealValue } from './types';

interface Props {
  leads: KanbanLead[];
}

function StatCard({
  label,
  value,
  color = 'var(--ink)',
  bg = 'transparent',
}: {
  label: string;
  value: string | number;
  color?: string;
  bg?: string;
}) {
  return (
    <Box
      flex={1}
      px="var(--space-5)"
      py="var(--space-4)"
      bg={bg}
      borderRadius="var(--radius-3)"
      minW="100px"
    >
      <Text
        fontFamily="var(--font-display)"
        fontStyle="italic"
        fontSize={{ base: '26px', md: '32px' }}
        fontWeight={600}
        lineHeight={1}
        color={color}
        letterSpacing="-0.03em"
        mb="4px"
      >
        {value}
      </Text>
      <Text
        fontFamily="var(--font-mono)"
        fontSize="10px"
        letterSpacing="0.10em"
        textTransform="uppercase"
        color="var(--mute)"
      >
        {label}
      </Text>
    </Box>
  );
}

export function PipelineStats({ leads }: Props) {
  const stats = useMemo(() => {
    const totalValue = leads.reduce((s, l) => s + getLeadDealValue(l), 0);
    const heuteFällig = leads.filter((l) => l.column === 'heute_fällig').length;
    const neuTerminieren = leads.filter((l) => l.column === 'neu_terminieren').length;
    const closed = leads.filter((l) => l.column === 'closed').length;

    return { totalValue, heuteFällig, neuTerminieren, closed };
  }, [leads]);

  const formatEuro = (v: number) =>
    v >= 1000
      ? `€${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`
      : `€${v.toLocaleString('de-DE')}`;

  return (
    <Box
      px="var(--space-7)"
      py="var(--space-3)"
      borderBottom="1px solid"
      borderBottomColor="var(--mist)"
      bg="var(--frost)"
      flexShrink={0}
    >
      <HStack spacing={0} divider={<Box w="1px" h="32px" bg="var(--mist)" />} overflowX="auto">
        <StatCard label="Leads gesamt" value={leads.length} />
        <StatCard
          label="Pipeline-Wert"
          value={stats.totalValue > 0 ? formatEuro(stats.totalValue) : '—'}
          color="var(--forest)"
        />
        <StatCard
          label="Heute fällig"
          value={stats.heuteFällig}
          color={stats.heuteFällig > 0 ? 'var(--forest)' : 'var(--mute)'}
        />
        <StatCard
          label="Neu terminieren"
          value={stats.neuTerminieren}
          color={stats.neuTerminieren > 0 ? '#854D0E' : 'var(--mute)'}
        />
        <StatCard
          label="Gewonnen"
          value={stats.closed}
          color={stats.closed > 0 ? 'var(--leaf)' : 'var(--mute)'}
        />
      </HStack>
    </Box>
  );
}
