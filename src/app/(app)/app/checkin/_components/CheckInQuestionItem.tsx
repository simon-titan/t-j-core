'use client';

import { Box, Text, Input, Textarea } from '@chakra-ui/react';
import type { CheckInQuestion } from './types';

interface Props {
  question:    CheckInQuestion;
  value:       string;
  onChange:    (questionId: string, value: string) => void;
  isLocked:    boolean;
}

export function CheckInQuestionItem({ question, value, onChange, isLocked }: Props) {
  const inputStyle = {
    fontFamily:    'var(--font-sans)',
    fontSize:      '14px',
    color:         'var(--ink)',
    background:    'var(--paper)',
    border:        '1px solid var(--mist)',
    borderRadius:  'var(--radius-3)',
    _focus: {
      borderColor: 'var(--leaf)',
      boxShadow:   '0 0 0 4px rgba(74,124,92,0.10)',
      outline:     'none',
    },
    _disabled: {
      opacity:    0.55,
      cursor:     'not-allowed',
      background: 'var(--frost)',
    },
  };

  if (question.type === 'number') {
    return (
      <Input
        type="number"
        value={value}
        onChange={e => onChange(question.id, e.target.value)}
        isDisabled={isLocked}
        placeholder="0"
        w="160px"
        h="44px"
        px={4}
        sx={inputStyle}
      />
    );
  }

  if (question.type === 'scale') {
    const current = value ? parseInt(value, 10) : null;
    return (
      <Box display="flex" gap={2} flexWrap="wrap">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
          const active = current === n;
          return (
            <Box
              key={n}
              as="button"
              type="button"
              onClick={() => !isLocked && onChange(question.id, String(n))}
              w="44px"
              h="44px"
              borderRadius="var(--radius-3)"
              border="1px solid"
              borderColor={active ? 'var(--forest)' : 'var(--mist)'}
              bg={active ? 'var(--forest)' : 'var(--paper)'}
              color={active ? 'var(--paper)' : 'var(--mute)'}
              fontFamily="var(--font-mono)"
              fontSize="13px"
              fontWeight={active ? 600 : 400}
              cursor={isLocked ? 'not-allowed' : 'pointer'}
              opacity={isLocked ? 0.55 : 1}
              transition="all 120ms var(--ease-default)"
              _hover={isLocked ? {} : { borderColor: 'var(--forest)', color: 'var(--forest)' }}
            >
              {n}
            </Box>
          );
        })}
      </Box>
    );
  }

  if (question.type === 'textarea') {
    return (
      <Textarea
        value={value}
        onChange={e => onChange(question.id, e.target.value)}
        isDisabled={isLocked}
        placeholder="Deine Antwort…"
        minH="112px"
        resize="vertical"
        fontFamily="var(--font-sans)"
        fontSize="14px"
        color="var(--ink)"
        bg="var(--paper)"
        border="1px solid var(--mist)"
        borderRadius="var(--radius-3)"
        p={4}
        _focus={{
          borderColor: 'var(--leaf)',
          boxShadow:   '0 0 0 4px rgba(74,124,92,0.10)',
          outline:     'none',
        }}
        _disabled={{ opacity: 0.55, cursor: 'not-allowed', background: 'var(--frost)' }}
      />
    );
  }

  if (question.type === 'text') {
    return (
      <Input
        type="text"
        value={value}
        onChange={e => onChange(question.id, e.target.value)}
        isDisabled={isLocked}
        placeholder="https://…"
        h="44px"
        px={4}
        sx={inputStyle}
      />
    );
  }

  if (question.type === 'select' && question.options) {
    return (
      <Box display="flex" gap={2} flexWrap="wrap">
        {question.options.map(opt => {
          const active = value === opt.value;
          return (
            <Box
              key={opt.value}
              as="button"
              type="button"
              onClick={() => !isLocked && onChange(question.id, opt.value)}
              px="16px"
              py="8px"
              borderRadius="var(--radius-full)"
              border="1px solid"
              borderColor={active ? 'var(--forest)' : 'var(--mist)'}
              bg={active ? 'var(--forest)' : 'var(--paper)'}
              color={active ? 'var(--paper)' : 'var(--mute)'}
              fontFamily="var(--font-sans)"
              fontSize="13px"
              fontWeight={active ? 500 : 400}
              cursor={isLocked ? 'not-allowed' : 'pointer'}
              opacity={isLocked ? 0.55 : 1}
              transition="all 120ms var(--ease-default)"
              _hover={isLocked ? {} : { borderColor: 'var(--forest)', color: active ? 'var(--paper)' : 'var(--forest)' }}
            >
              {opt.label}
            </Box>
          );
        })}
      </Box>
    );
  }

  return (
    <Text fontFamily="var(--font-mono)" fontSize="12px" color="var(--mute)">
      Unbekannter Fragentyp: {question.type}
    </Text>
  );
}
