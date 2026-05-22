'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
  Text,
  SimpleGrid,
  HStack,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MemberMetrics } from './types';
import { DmsPerDayChart } from './DmsPerDayChart';

const MotionBox = motion(Box);

const modalVariants = {
  hidden:  { opacity: 0, y: 12, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.25, ease: [0.65, 0, 0.35, 1] } },
  exit:    { opacity: 0, y: 8,  scale: 0.97, transition: { duration: 0.18 } },
};

interface MiniWidgetProps {
  label: string;
  value: string;
  unit?: string;
}

function MiniWidget({ label, value, unit }: MiniWidgetProps) {
  return (
    <Box
      bg="rgba(248,248,250,0.85)"
      backdropFilter="blur(12px) saturate(1.4)"
      border="1px solid rgba(14,14,12,0.08)"
      borderRadius="var(--radius-4)"
      p={4}
      boxShadow="var(--shadow-cool-2)"
    >
      <Text
        fontFamily="var(--font-mono)"
        fontSize="10px"
        letterSpacing="0.10em"
        textTransform="uppercase"
        color="var(--mute)"
        mb={1}
      >
        {label}
      </Text>
      <Text
        fontFamily="var(--font-display)"
        fontSize="28px"
        fontStyle="italic"
        lineHeight={1.1}
        letterSpacing="-0.02em"
        color="var(--ink)"
      >
        {value}
        {unit && (
          <Text as="span" fontSize="16px" color="var(--mute)">
            {unit}
          </Text>
        )}
      </Text>
    </Box>
  );
}

interface Props {
  member:  MemberMetrics | null;
  onClose: () => void;
}

export function MemberDetailModal({ member, onClose }: Props) {
  const isOpen = !!member;

  const answerRate = member && member.dms > 0
    ? Math.round((member.answered / member.dms) * 100)
    : 0;
  const apptRate   = member && member.dms > 0
    ? Math.round((member.appointments / member.dms) * 100)
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
      <ModalOverlay
        bg="rgba(14,14,12,0.65)"
        backdropFilter="blur(4px)"
      />
      <AnimatePresence>
        {isOpen && member && (
          <ModalContent
            as={MotionBox}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            bg="var(--paper)"
            border="1px solid var(--mist)"
            borderRadius="var(--radius-5)"
            boxShadow="var(--shadow-4)"
            p={8}
            maxH="85vh"
            overflowY="auto"
          >
            <ModalCloseButton
              top={6}
              right={6}
              color="var(--mute)"
              _hover={{ color: 'var(--ink)', bg: 'var(--frost)' }}
              borderRadius="var(--radius-2)"
            />
            <ModalBody p={0}>
              {/* Header */}
              <Box mb={6}>
                <HStack spacing={2} mb={2}>
                  <Text
                    fontFamily="var(--font-mono)"
                    fontSize="10px"
                    letterSpacing="0.12em"
                    textTransform="uppercase"
                    color="var(--mute)"
                  >
                    — Mitglied
                  </Text>
                </HStack>
                <Text
                  fontFamily="var(--font-display)"
                  fontSize="28px"
                  fontStyle="italic"
                  lineHeight={1.1}
                  letterSpacing="-0.02em"
                  color="var(--ink)"
                >
                  {member.fullName}
                </Text>
              </Box>

              {/* Mini KPIs */}
              <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={3} mb={6}>
                <MiniWidget label="DMs"         value={member.dms.toString()} />
                <MiniWidget label="Antwortrate" value={answerRate.toString()} unit=" %" />
                <MiniWidget label="Terminrate"  value={apptRate.toString()}   unit=" %" />
                <MiniWidget label="Deals"       value={member.deals.toString()} />
              </SimpleGrid>

              {/* Daily chart */}
              <Box
                bg="var(--frost)"
                border="1px solid var(--mist)"
                borderRadius="var(--radius-3)"
                p={5}
                mb={6}
              >
                <Text
                  fontFamily="var(--font-mono)"
                  fontSize="10px"
                  letterSpacing="0.10em"
                  textTransform="uppercase"
                  color="var(--mute)"
                  mb={4}
                >
                  DMs pro Tag
                </Text>
                {member.dailyDms.length > 0 ? (
                  <DmsPerDayChart data={member.dailyDms} />
                ) : (
                  <Text fontSize="13px" color="var(--mute)" fontFamily="var(--font-sans)">
                    Keine Daten im gewählten Zeitraum.
                  </Text>
                )}
              </Box>
            </ModalBody>
          </ModalContent>
        )}
      </AnimatePresence>
    </Modal>
  );
}
