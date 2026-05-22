'use client';

import { Box, Text, Textarea, Input, HStack, Checkbox, SimpleGrid, VStack } from '@chakra-ui/react';
import type { OnboardingQuestion, OnboardingAnswer } from '@/lib/types/database';
import type { AdminNoteWithAdmin } from '../../_components/types';
import { VisibilityToggle } from './VisibilityToggle';
import { AdminNoteBanner } from './AdminNoteBanner';

interface Props {
  question:    OnboardingQuestion;
  answer:      OnboardingAnswer | undefined;
  onChange:    (questionId: string, value: string | string[], visibility: 'private' | 'team') => void;
  isReadOnly?: boolean;
  adminNote?:  AdminNoteWithAdmin;
}

export function QuestionItem({ question, answer, onChange, isReadOnly, adminNote }: Props) {
  const visibility = answer?.visibility ?? 'private';
  const textValue  = answer?.answer_text ?? '';
  const jsonValue  = (answer?.answer_json as string[] | null) ?? [];

  function handleTextChange(val: string) {
    onChange(question.id, val, visibility);
  }

  function handleCheckboxChange(option: string, checked: boolean) {
    const next = checked
      ? [...jsonValue, option]
      : jsonValue.filter((v) => v !== option);
    onChange(question.id, next, visibility);
  }

  function handleVisibilityChange(v: 'private' | 'team') {
    if (question.type === 'checkbox_group') {
      onChange(question.id, jsonValue, v);
    } else {
      onChange(question.id, textValue, v);
    }
  }

  return (
    <Box>
      {/* Question text */}
      <Text
        fontFamily="var(--font-sans)"
        fontSize="16px"
        fontWeight={600}
        color="var(--ink)"
        lineHeight={1.4}
        letterSpacing="-0.01em"
        mb={question.helper_text ? 'var(--space-2)' : 'var(--space-4)'}
      >
        {question.question_text}
        {question.is_required && (
          <Box as="span" color="var(--forest)" ml="4px">*</Box>
        )}
      </Text>

      {/* Helper text */}
      {question.helper_text && (
        <Text
          fontFamily="var(--font-sans)"
          fontSize="13px"
          color="rgba(14,14,12,0.60)"
          lineHeight={1.55}
          mb="var(--space-4)"
          pl="var(--space-2)"
          borderLeft="2px solid var(--mist)"
        >
          {question.helper_text}
        </Text>
      )}

      {/* Input */}
      <VStack align="stretch" gap="var(--space-3)">
        {question.type === 'textarea' && (
          <Textarea
            value={textValue}
            onChange={(e) => handleTextChange(e.target.value)}
            isReadOnly={isReadOnly}
            placeholder="Deine Antwort…"
            minH="112px"
            bg="white"
            border="1px solid var(--mist)"
            borderRadius="var(--radius-3)"
            fontFamily="var(--font-sans)"
            fontSize="14px"
            lineHeight={1.65}
            color="var(--ink)"
            resize="vertical"
            p="14px"
            _placeholder={{ color: 'var(--mute)', opacity: 0.55 }}
            _hover={{ borderColor: 'rgba(139,134,126,0.5)' }}
            _focus={{
              borderColor: 'var(--leaf)',
              boxShadow: '0 0 0 4px rgba(74,124,92,0.10)',
              outline: 'none',
            }}
            _readOnly={{ opacity: 0.65, cursor: 'default', bg: 'var(--frost)' }}
          />
        )}

        {question.type === 'text' && (
          <Input
            value={textValue}
            onChange={(e) => handleTextChange(e.target.value)}
            isReadOnly={isReadOnly}
            placeholder="Deine Antwort…"
            bg="white"
            border="1px solid var(--mist)"
            borderRadius="var(--radius-3)"
            fontFamily="var(--font-sans)"
            fontSize="14px"
            color="var(--ink)"
            h="48px"
            px="14px"
            _placeholder={{ color: 'var(--mute)', opacity: 0.55 }}
            _hover={{ borderColor: 'rgba(139,134,126,0.5)' }}
            _focus={{
              borderColor: 'var(--leaf)',
              boxShadow: '0 0 0 4px rgba(74,124,92,0.10)',
              outline: 'none',
            }}
            _readOnly={{ opacity: 0.65, cursor: 'default', bg: 'var(--frost)' }}
          />
        )}

        {question.type === 'checkbox_group' && question.options && (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="var(--space-2)">
            {question.options.map((option) => {
              const checked = jsonValue.includes(option);
              return (
                <Box
                  key={option}
                  as="label"
                  display="flex"
                  alignItems="center"
                  gap="var(--space-3)"
                  px="var(--space-5)"
                  py="var(--space-4)"
                  borderRadius="var(--radius-3)"
                  border="1px solid"
                  cursor={isReadOnly ? 'default' : 'pointer'}
                  transition="all 140ms var(--ease-default)"
                  style={
                    checked
                      ? { background: 'rgba(74,124,92,0.07)', borderColor: 'rgba(74,124,92,0.35)', color: 'var(--forest)' }
                      : { background: 'white', borderColor: 'var(--mist)', color: 'var(--ink)' }
                  }
                  _hover={isReadOnly ? {} : checked ? {} : { borderColor: 'rgba(139,134,126,0.5)', boxShadow: 'var(--shadow-1)' }}
                >
                  <Checkbox
                    isChecked={checked}
                    isReadOnly={isReadOnly}
                    onChange={(e) => !isReadOnly && handleCheckboxChange(option, e.target.checked)}
                    colorScheme="green"
                    borderColor="var(--mist)"
                    flexShrink={0}
                  />
                  <Text
                    fontFamily="var(--font-sans)"
                    fontSize="14px"
                    lineHeight={1.4}
                    userSelect="none"
                  >
                    {option}
                  </Text>
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </VStack>

      {/* Visibility toggle */}
      {!isReadOnly && (
        <HStack justify="flex-end" mt="var(--space-3)">
          <VisibilityToggle
            value={visibility}
            onChange={handleVisibilityChange}
          />
        </HStack>
      )}

      {/* Admin note banner */}
      {adminNote && <AdminNoteBanner note={adminNote} />}
    </Box>
  );
}
