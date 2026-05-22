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
} from '@chakra-ui/react';
import type { TemplateMetrics } from './types';

interface Props {
  templates: TemplateMetrics[];
}

const th: React.CSSProperties = {
  fontFamily:    'var(--font-mono)',
  fontSize:      '10px',
  letterSpacing: '0.10em',
  textTransform: 'uppercase',
  color:         'var(--mute)',
  fontWeight:    500,
  paddingBottom: '8px',
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

export function TemplatePerformanceTable({ templates }: Props) {
  const sorted = [...templates].sort((a, b) => b.answerRate - a.answerRate);

  if (sorted.length === 0) {
    return (
      <Text fontFamily="var(--font-sans)" fontSize="14px" color="var(--mute)">
        Keine Templates mit Daten im gewählten Zeitraum.
      </Text>
    );
  }

  return (
    <Box overflowX="auto">
      <Table variant="unstyled" size="sm">
        <Thead>
          <Tr>
            <Th style={th} pl={0}>Template</Th>
            <Th style={th} isNumeric>DMs</Th>
            <Th style={th}>Antwortrate</Th>
            <Th style={th}>Terminrate</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sorted.map(t => (
            <Tr
              key={t.templateId}
              borderBottom="1px solid var(--mist)"
              _last={{ borderBottom: 'none' }}
            >
              <Td
                pl={0}
                py={3}
                fontFamily="var(--font-sans)"
                fontSize="14px"
                color="var(--ink)"
              >
                {t.name}
              </Td>
              <Td
                isNumeric
                py={3}
                fontFamily="var(--font-mono)"
                fontSize="13px"
                color="var(--ink)"
              >
                {t.dms}
              </Td>
              <Td py={3}><RateBadge value={t.answerRate} /></Td>
              <Td py={3}><RateBadge value={t.apptRate} /></Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
