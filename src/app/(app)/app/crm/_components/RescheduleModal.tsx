'use client';

import { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Textarea,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { RESCHEDULE_REASONS } from './types';

const MotionBox = motion(Box);

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: [0.65, 0, 0.35, 1] },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.97,
    transition: { duration: 0.18 },
  },
};

interface Props {
  onConfirm: (reason: string, notes: string) => void;
  onCancel: () => void;
}

export function RescheduleModal({ onConfirm, onCancel }: Props) {
  const [selectedReason, setSelectedReason] = useState('');
  const [notes, setNotes] = useState('');

  const canConfirm = selectedReason !== '';

  return (
    <MotionBox
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      position="fixed"
      inset={0}
      bg="rgba(14,14,12,0.65)"
      backdropFilter="blur(4px)"
      zIndex={200}
      display="flex"
      alignItems="center"
      justifyContent="center"
      onClick={onCancel}
    >
      <MotionBox
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        bg="var(--paper)"
        border="1px solid var(--mist)"
        borderRadius="var(--radius-5)"
        boxShadow="var(--shadow-4)"
        p="var(--space-8)"
        maxW="480px"
        w="90vw"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <HStack justify="space-between" align="flex-start" mb="var(--space-5)">
          <Box>
            <HStack spacing="var(--space-3)" mb={1}>
              <AlertTriangle size={16} strokeWidth={1.5} color="#854D0E" />
              <Text
                fontFamily="var(--font-mono)"
                fontSize="10px"
                letterSpacing="0.12em"
                textTransform="uppercase"
                color="var(--mute)"
              >
                — NEU TERMINIEREN
              </Text>
            </HStack>
            <Text
              fontFamily="var(--font-display)"
              fontStyle="italic"
              fontSize="24px"
              lineHeight={1.2}
              letterSpacing="-0.02em"
              color="var(--ink)"
            >
              Warum ist der Termin geplatzt?
            </Text>
          </Box>
          <Box
            as="button"
            onClick={onCancel}
            color="var(--mute)"
            _hover={{ color: 'var(--ink)' }}
            transition="color 150ms ease"
            p={1}
            mt={-1}
            mr={-1}
          >
            <X size={18} strokeWidth={2} />
          </Box>
        </HStack>

        {/* Chase Trail Divider */}
        <Box h="1px" bg="var(--mist)" mb="var(--space-6)" />

        {/* Reason Selection */}
        <VStack align="stretch" spacing="var(--space-3)" mb="var(--space-6)">
          <Text
            fontFamily="var(--font-sans)"
            fontSize="13px"
            fontWeight={500}
            color="var(--ink)"
          >
            Grund{' '}
            <Box as="span" color="rgba(239,68,68,0.8)" fontSize="12px">
              *
            </Box>
          </Text>
          <VStack align="stretch" spacing="var(--space-2)">
            {RESCHEDULE_REASONS.map((reason) => (
              <Box
                key={reason}
                as="button"
                textAlign="left"
                onClick={() => setSelectedReason(reason)}
                bg={
                  selectedReason === reason
                    ? 'rgba(74,124,92,0.08)'
                    : 'var(--frost)'
                }
                border="1px solid"
                borderColor={
                  selectedReason === reason
                    ? 'var(--leaf)'
                    : 'var(--mist)'
                }
                borderRadius="var(--radius-2)"
                px="var(--space-5)"
                py="var(--space-3)"
                fontFamily="var(--font-sans)"
                fontSize="14px"
                color={
                  selectedReason === reason ? 'var(--forest)' : 'var(--ink)'
                }
                transition="all 150ms ease"
                _hover={{
                  borderColor: 'var(--mute)',
                  bg: 'white',
                }}
              >
                {reason}
              </Box>
            ))}
          </VStack>
        </VStack>

        {/* Optional Notes */}
        <VStack align="stretch" spacing="var(--space-2)" mb="var(--space-7)">
          <Text
            fontFamily="var(--font-sans)"
            fontSize="13px"
            fontWeight={500}
            color="var(--ink)"
          >
            Notiz (optional)
          </Text>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Zusätzliche Informationen..."
            bg="var(--frost)"
            border="1px solid var(--mist)"
            borderRadius="var(--radius-2)"
            fontFamily="var(--font-sans)"
            fontSize="14px"
            color="var(--ink)"
            resize="none"
            rows={3}
            _placeholder={{ color: 'var(--mute)', opacity: 0.65 }}
            _hover={{ borderColor: 'var(--mute)' }}
            _focus={{
              borderColor: 'var(--leaf)',
              boxShadow: '0 0 0 3px rgba(74,124,92,0.12)',
              outline: 'none',
            }}
          />
        </VStack>

        {/* Actions */}
        <HStack justify="flex-end" spacing="var(--space-3)">
          <Button
            onClick={onCancel}
            variant="ghost"
            fontFamily="var(--font-sans)"
            fontSize="14px"
            fontWeight={400}
            color="var(--mute)"
            bg="transparent"
            _hover={{ color: 'var(--ink)', bg: 'var(--frost)' }}
            borderRadius="var(--radius-2)"
            px="var(--space-5)"
            h="38px"
          >
            Abbrechen
          </Button>
          <Button
            onClick={() => canConfirm && onConfirm(selectedReason, notes)}
            isDisabled={!canConfirm}
            bg={canConfirm ? 'var(--ink)' : 'var(--mist)'}
            color={canConfirm ? 'var(--paper)' : 'var(--mute)'}
            fontFamily="var(--font-sans)"
            fontSize="14px"
            fontWeight={500}
            borderRadius="var(--radius-2)"
            px="var(--space-5)"
            h="38px"
            _hover={{ bg: canConfirm ? 'var(--forest-deep)' : 'var(--mist)' }}
            _active={{ transform: canConfirm ? 'scale(0.97)' : undefined }}
            cursor={canConfirm ? 'pointer' : 'not-allowed'}
            transition="all 150ms ease"
          >
            Bestätigen →
          </Button>
        </HStack>
      </MotionBox>
    </MotionBox>
  );
}
