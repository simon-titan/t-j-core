'use client';

import { HStack, Select, Box, Text } from '@chakra-ui/react';
import type { TemplateOption, PitchStatus } from './types';

interface Props {
  templates:      TemplateOption[];
  templateFilter: string;
  statusFilter:   string;
  onTemplate:     (v: string) => void;
  onStatus:       (v: string) => void;
}

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'Alle Status',    value: '' },
  { label: 'Gesendet',       value: 'sent' },
  { label: 'Zugestellt',     value: 'delivered' },
  { label: 'Geantwortet',    value: 'answered' },
  { label: 'Ignoriert',      value: 'ignored' },
  { label: 'Fehlgeschlagen', value: 'bounced' },
];

const selectStyles = {
  bg:          'var(--frost)',
  border:      '1px solid var(--mist)',
  borderRadius:'var(--radius-2)',
  fontFamily:  'var(--font-sans)',
  fontSize:    '13px',
  color:       'var(--ink)',
  h:           '36px',
  minW:        '160px',
  cursor:      'pointer',
  _hover:      { borderColor: 'var(--mute)' },
  _focus:      { borderColor: 'var(--leaf)', boxShadow: '0 0 0 3px rgba(74,124,92,0.12)' },
};

export function FilterBar({ templates, templateFilter, statusFilter, onTemplate, onStatus }: Props) {
  return (
    <HStack spacing={3} mb={5} flexWrap="wrap">
      <Text fontFamily="var(--font-mono)" fontSize="10px" letterSpacing="0.10em" textTransform="uppercase" color="var(--mute)" mr={1}>
        Filter
      </Text>

      <Select
        {...selectStyles}
        value={templateFilter}
        onChange={e => onTemplate(e.target.value)}
        aria-label="Template-Filter"
      >
        <option value="">Alle Templates</option>
        {templates.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </Select>

      <Select
        {...selectStyles}
        value={statusFilter}
        onChange={e => onStatus(e.target.value)}
        aria-label="Status-Filter"
      >
        {STATUS_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </Select>
    </HStack>
  );
}
