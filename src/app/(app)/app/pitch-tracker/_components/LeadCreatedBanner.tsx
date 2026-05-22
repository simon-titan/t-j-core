'use client';

import { useEffect } from 'react';
import { Box, HStack, Text, IconButton } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

const MotionBox = motion(Box);

interface Props {
  prospectName: string | null;
  onDismiss:    () => void;
}

export function LeadCreatedBanner({ prospectName, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      <MotionBox
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -12, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
        bg="var(--forest)"
        borderRadius="var(--radius-3)"
        px={5}
        py={3}
        mb={5}
      >
        <HStack justify="space-between">
          <HStack spacing={3}>
            <CheckCircle2 size={16} strokeWidth={1.5} color="var(--paper)" />
            <Text fontFamily="var(--font-sans)" fontSize="14px" color="var(--paper)" fontWeight={500}>
              Lead erstellt
              {prospectName && (
                <Text as="span" fontWeight={400} color="rgba(252,252,253,0.75)">
                  {' '}— {prospectName} wurde automatisch ins CRM übertragen.
                </Text>
              )}
            </Text>
          </HStack>
          <IconButton
            aria-label="Banner schließen"
            icon={<X size={14} strokeWidth={2} />}
            variant="ghost"
            size="xs"
            color="rgba(252,252,253,0.70)"
            _hover={{ color: 'var(--paper)', bg: 'rgba(255,255,255,0.10)' }}
            onClick={onDismiss}
          />
        </HStack>
      </MotionBox>
    </AnimatePresence>
  );
}
