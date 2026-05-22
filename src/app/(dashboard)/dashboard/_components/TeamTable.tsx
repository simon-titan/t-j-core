'use client';

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Text,
  HStack,
} from '@chakra-ui/react';
import { ChevronRight } from 'lucide-react';
import type { MemberMetrics } from './types';

interface Props {
  members:  MemberMetrics[];
  onSelect: (m: MemberMetrics) => void;
}

const thStyle: React.CSSProperties = {
  fontFamily:    'var(--font-mono)',
  fontSize:      '10px',
  letterSpacing: '0.10em',
  textTransform: 'uppercase',
  color:         'var(--mute)',
  fontWeight:    500,
  paddingBottom: '10px',
  borderBottom:  '1px solid var(--mist)',
};

function RateBadge({ value }: { value: number }) {
  const isGood = value >= 30;
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      px={2}
      py="2px"
      borderRadius="var(--radius-full)"
      bg={isGood ? 'rgba(74,124,92,0.12)' : 'var(--frost)'}
      border="1px solid"
      borderColor={isGood ? 'rgba(74,124,92,0.25)' : 'var(--mist)'}
      fontFamily="var(--font-sans)"
      fontSize="11px"
      fontWeight={500}
      color={isGood ? 'var(--forest)' : 'var(--mute)'}
    >
      {value}%
    </Box>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <Box
      w={8}
      h={8}
      borderRadius="var(--radius-full)"
      bg="var(--forest)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
    >
      <Text
        fontFamily="var(--font-sans)"
        fontSize="11px"
        fontWeight={600}
        color="var(--paper)"
      >
        {initials}
      </Text>
    </Box>
  );
}

function formatEur(value: number): string {
  if (value >= 1_000_000) return `€ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)     return `€ ${(value / 1_000).toFixed(1)}k`;
  return `€ ${value}`;
}

export function TeamTable({ members, onSelect }: Props) {
  const sorted = [...members].sort((a, b) => b.dms - a.dms);

  if (sorted.length === 0) {
    return (
      <Text fontFamily="var(--font-sans)" fontSize="14px" color="var(--mute)">
        Keine Mitglieder mit Aktivität im gewählten Zeitraum.
      </Text>
    );
  }

  return (
    <Box overflowX="auto">
      <Table variant="unstyled" size="sm">
        <Thead>
          <Tr>
            <Th style={thStyle} pl={0}>Mitglied</Th>
            <Th style={thStyle} isNumeric>DMs</Th>
            <Th style={thStyle}>Antwortrate</Th>
            <Th style={thStyle}>Terminrate</Th>
            <Th style={thStyle} isNumeric>Deals</Th>
            <Th style={thStyle} isNumeric>Deal-Wert</Th>
            <Th style={thStyle} />
          </Tr>
        </Thead>
        <Tbody>
          {sorted.map(m => {
            const answerRate = m.dms > 0 ? Math.round((m.answered / m.dms) * 100) : 0;
            const apptRate   = m.dms > 0 ? Math.round((m.appointments / m.dms) * 100) : 0;
            return (
              <Tr
                key={m.userId}
                onClick={() => onSelect(m)}
                cursor="pointer"
                borderBottom="1px solid var(--mist)"
                _last={{ borderBottom: 'none' }}
                transition="background 120ms var(--ease-default)"
                _hover={{ bg: 'rgba(14,14,12,0.03)' }}
                borderRadius="var(--radius-2)"
              >
                <Td pl={0} py={3}>
                  <HStack spacing={3}>
                    <Avatar name={m.fullName} />
                    <Text
                      fontFamily="var(--font-sans)"
                      fontSize="14px"
                      fontWeight={500}
                      color="var(--ink)"
                    >
                      {m.fullName}
                    </Text>
                  </HStack>
                </Td>
                <Td
                  isNumeric
                  py={3}
                  fontFamily="var(--font-mono)"
                  fontSize="13px"
                  color="var(--ink)"
                >
                  {m.dms}
                </Td>
                <Td py={3}><RateBadge value={answerRate} /></Td>
                <Td py={3}><RateBadge value={apptRate} /></Td>
                <Td
                  isNumeric
                  py={3}
                  fontFamily="var(--font-mono)"
                  fontSize="13px"
                  color="var(--ink)"
                >
                  {m.deals}
                </Td>
                <Td
                  isNumeric
                  py={3}
                  fontFamily="var(--font-mono)"
                  fontSize="13px"
                  color="var(--ink)"
                >
                  {formatEur(m.dealValue)}
                </Td>
                <Td py={3} pr={0} textAlign="right">
                  <ChevronRight size={16} strokeWidth={1.5} color="var(--mute)" />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
}
