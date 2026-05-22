'use client';

import { Box, HStack, Text } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface Props {
  state: SaveState;
}

const MotionBox = motion(Box);

export function SaveIndicator({ state }: Props) {
  return (
    <Box
      position="sticky"
      top="76px"
      zIndex={10}
      display="flex"
      justifyContent="flex-end"
      pointerEvents="none"
      mb="-28px"
    >
      <AnimatePresence mode="wait">
        {state !== 'idle' && (
          <MotionBox
            key={state}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            bg="var(--frost)"
            border="1px solid var(--mist)"
            borderRadius="var(--radius-full)"
            px="12px"
            py="6px"
            style={{ boxShadow: 'var(--shadow-1)' }}
          >
            <HStack gap="6px">
              {state === 'saving' && (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, ease: 'linear', repeat: Infinity }}
                    style={{ display: 'flex' }}
                  >
                    <Loader2 size={13} strokeWidth={2} color="var(--mute)" />
                  </motion.div>
                  <Text
                    fontFamily="var(--font-sans)"
                    fontSize="12px"
                    color="var(--mute)"
                  >
                    Speichert…
                  </Text>
                </>
              )}
              {state === 'saved' && (
                <>
                  <CheckCircle2 size={13} strokeWidth={2} color="var(--forest)" />
                  <Text
                    fontFamily="var(--font-sans)"
                    fontSize="12px"
                    color="var(--forest)"
                    fontWeight={500}
                  >
                    Gespeichert
                  </Text>
                </>
              )}
              {state === 'error' && (
                <>
                  <AlertCircle size={13} strokeWidth={2} color="#991B1B" />
                  <Text
                    fontFamily="var(--font-sans)"
                    fontSize="12px"
                    color="#991B1B"
                  >
                    Fehler beim Speichern
                  </Text>
                </>
              )}
            </HStack>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
}
