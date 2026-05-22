'use client';

import { Box, Text, HStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import type { AdminNoteWithAdmin } from '../../_components/types';

const MotionBox = motion(Box);

interface Props {
  note: AdminNoteWithAdmin;
}

export function AdminNoteBanner({ note }: Props) {
  const adminName = note.admin?.full_name ?? 'Admin';

  return (
    <MotionBox
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
      bg="rgba(234,179,8,0.08)"
      borderLeft="2px solid rgba(234,179,8,0.60)"
      borderRadius="0 var(--radius-2) var(--radius-2) 0"
      px="var(--space-5)"
      py="var(--space-4)"
      mt="var(--space-4)"
    >
      <HStack gap="var(--space-3)" mb="var(--space-2)" align="center">
        <MessageSquare size={13} strokeWidth={1.5} color="rgba(133,77,14,0.80)" />
        <Text
          fontFamily="var(--font-sans)"
          fontSize="12px"
          fontWeight={500}
          color="#854D0E"
          letterSpacing="0.02em"
        >
          Notiz von {adminName}
        </Text>
      </HStack>
      <Text
        fontFamily="var(--font-sans)"
        fontSize="13px"
        color="var(--ink)"
        lineHeight={1.6}
        whiteSpace="pre-wrap"
      >
        {note.note_text}
      </Text>
    </MotionBox>
  );
}
