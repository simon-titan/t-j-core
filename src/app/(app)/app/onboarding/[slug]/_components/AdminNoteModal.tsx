'use client';

import { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalBody,
  Button, Textarea, Text, Box, HStack, VStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { OnboardingQuestion } from '@/lib/types/database';
import type { AdminNoteWithAdmin } from '../../_components/types';

const MotionModalContent = motion(ModalContent);

interface Props {
  isOpen:        boolean;
  onClose:       () => void;
  question:      OnboardingQuestion;
  targetUserId:  string;
  orgId:         string;
  adminId:       string;
  existingNote?: AdminNoteWithAdmin;
  onSaved:       (note: AdminNoteWithAdmin) => void;
}

export function AdminNoteModal({
  isOpen, onClose, question, targetUserId, orgId, adminId, existingNote, onSaved,
}: Props) {
  const [text,    setText]    = useState(existingNote?.note_text ?? '');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!text.trim()) return;
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('onboarding_admin_notes')
      .insert({
        question_id:    question.id,
        target_user_id: targetUserId,
        admin_id:       adminId,
        org_id:         orgId,
        note_text:      text.trim(),
      })
      .select('*, admin:admin_id(full_name)')
      .single();

    setLoading(false);
    if (!error && data) {
      onSaved(data as AdminNoteWithAdmin);
      onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay bg="rgba(14,14,12,0.65)" backdropFilter="blur(4px)" />
      <MotionModalContent
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] } as any}
        bg="var(--paper)"
        border="1px solid var(--mist)"
        borderRadius="var(--radius-5)"
        boxShadow="var(--shadow-4)"
        mx={4}
      >
        <ModalBody p="var(--space-8)">
          <VStack align="stretch" gap="var(--space-5)">
            {/* Header */}
            <Text
              fontFamily="var(--font-display)"
              fontSize="24px"
              fontStyle="italic"
              lineHeight={1.2}
              letterSpacing="-0.02em"
              color="var(--ink)"
            >
              Notiz schreiben
            </Text>

            {/* Question context */}
            <Box
              bg="var(--frost)"
              border="1px solid var(--mist)"
              borderRadius="var(--radius-2)"
              px="var(--space-5)"
              py="var(--space-4)"
            >
              <Text
                fontFamily="var(--font-sans)"
                fontSize="12px"
                color="var(--mute)"
                mb="4px"
              >
                Frage
              </Text>
              <Text
                fontFamily="var(--font-sans)"
                fontSize="13px"
                color="var(--ink)"
                lineHeight={1.5}
              >
                {question.question_text}
              </Text>
            </Box>

            {/* Note textarea */}
            <Box>
              <Text
                fontFamily="var(--font-sans)"
                fontSize="13px"
                fontWeight={500}
                color="var(--ink)"
                mb="var(--space-2)"
              >
                Deine Notiz
              </Text>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Notiz für diesen User…"
                minH="120px"
                bg="var(--frost)"
                border="1px solid var(--mist)"
                borderRadius="var(--radius-2)"
                fontFamily="var(--font-sans)"
                fontSize="14px"
                resize="vertical"
                _focus={{
                  borderColor: 'var(--leaf)',
                  boxShadow: '0 0 0 3px rgba(74,124,92,0.12)',
                  outline: 'none',
                }}
              />
            </Box>

            {/* Actions */}
            <HStack justify="flex-end" gap="var(--space-3)">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                fontFamily="var(--font-sans)"
                color="var(--mute)"
                _hover={{ color: 'var(--ink)' }}
              >
                Abbrechen
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                isLoading={loading}
                isDisabled={!text.trim()}
                bg="var(--forest)"
                color="var(--paper)"
                borderRadius="var(--radius-2)"
                fontFamily="var(--font-sans)"
                fontWeight={500}
                _hover={{ bg: 'var(--glow)' }}
                _active={{ transform: 'scale(0.97)' }}
              >
                Speichern
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </MotionModalContent>
    </Modal>
  );
}
