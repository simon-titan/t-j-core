'use client';

import Link from 'next/link';
import { Box, Flex, Grid, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight } from 'lucide-react';
import type { ModuleProgressItem } from './types';

const MotionBox = motion(Box);

interface Props {
  overallPct:     number;
  totalAnswered:  number;
  totalQuestions: number;
  nextModules:    ModuleProgressItem[];
}

export function OnboardingProgress({
  overallPct,
  totalAnswered,
  totalQuestions,
  nextModules,
}: Props) {
  return (
    <Box
      bg="rgba(248,248,250,0.85)"
      backdropFilter="blur(12px) saturate(1.4)"
      border="1px solid rgba(14,14,12,0.08)"
      borderRadius="var(--radius-5)"
      p={6}
      boxShadow="var(--shadow-cool-2)"
    >
      {/* Header */}
      <Flex justify="space-between" align="center" mb={4}>
        <Box>
          <Text
            fontFamily="var(--font-mono)"
            fontSize="10px"
            letterSpacing="0.10em"
            textTransform="uppercase"
            color="var(--mute)"
            mb={1}
          >
            — Onboarding
          </Text>
          <Text
            fontFamily="var(--font-display)"
            fontSize="22px"
            fontStyle="italic"
            letterSpacing="-0.02em"
            color="var(--ink)"
          >
            Dein Fortschritt
          </Text>
        </Box>
        <Link
          href="/app/onboarding"
          style={{
            fontFamily:     'var(--font-sans)',
            fontSize:       '13px',
            color:          'var(--forest)',
            borderBottom:   '1px solid var(--forest)',
            textDecoration: 'none',
            display:        'flex',
            alignItems:     'center',
            gap:            '4px',
          }}
        >
          Alle Module
          <ChevronRight size={14} strokeWidth={1.5} />
        </Link>
      </Flex>

      {/* Animated progress bar */}
      <Box mb={2}>
        <Box
          h="8px"
          bg="var(--mist)"
          borderRadius="var(--radius-full)"
          overflow="hidden"
        >
          <MotionBox
            h="100%"
            borderRadius="var(--radius-full)"
            style={{ background: 'var(--gradient-leaf-glow)' }}
            initial={{ width: 0 }}
            animate={{ width: `${overallPct}%` }}
            transition={{ duration: 1.0, ease: [0.65, 0, 0.35, 1], delay: 0.3 }}
          />
        </Box>
      </Box>
      <Text fontSize="12px" color="var(--mute)" mb={6}>
        <Text as="span" fontWeight={500} color="var(--forest)">
          {overallPct}%
        </Text>
        {' '}abgeschlossen · {totalAnswered} von {totalQuestions} Fragen beantwortet
      </Text>

      {/* Next modules */}
      {nextModules.length > 0 && (
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          {nextModules.map((mod, i) => (
            <Link
              key={mod.id}
              href={`/app/onboarding/${mod.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <Box
                bg="var(--frost)"
                border="1px solid var(--mist)"
                borderLeft={mod.status === 'in_progress' ? '2px solid var(--forest)' : '1px solid var(--mist)'}
                borderRadius="var(--radius-3)"
                p={4}
                cursor="pointer"
                transition="all 200ms cubic-bezier(0.4,0,0.2,1)"
                _hover={{
                  borderColor:    'var(--mute)',
                  boxShadow:      'var(--shadow-2)',
                  transform:      'translateY(-2px)',
                }}
              >
                <Flex align="center" gap={2} mb={3}>
                  <Box color="var(--forest)">
                    <BookOpen size={16} strokeWidth={1.25} />
                  </Box>
                  <Text
                    fontFamily="var(--font-sans)"
                    fontSize="13px"
                    fontWeight={500}
                    color="var(--ink)"
                    lineHeight={1.3}
                    noOfLines={2}
                  >
                    {mod.title}
                  </Text>
                </Flex>

                {/* Mini animated progress bar */}
                <Box
                  h="3px"
                  bg="var(--mist)"
                  borderRadius="var(--radius-full)"
                  overflow="hidden"
                  mb={2}
                >
                  <MotionBox
                    h="100%"
                    borderRadius="var(--radius-full)"
                    style={{ background: 'var(--gradient-leaf-glow)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${mod.percentage}%` }}
                    transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1], delay: 0.4 + i * 0.08 }}
                  />
                </Box>

                <Text fontSize="11px" color="var(--mute)">
                  {mod.percentage > 0 ? `${mod.percentage}% · Weiter` : 'Noch nicht gestartet'}
                </Text>
              </Box>
            </Link>
          ))}
        </Grid>
      )}

      {nextModules.length === 0 && (
        <Box
          bg="rgba(74,124,92,0.06)"
          border="1px solid rgba(74,124,92,0.20)"
          borderRadius="var(--radius-3)"
          p={4}
          textAlign="center"
        >
          <Text fontSize="14px" color="var(--forest)" fontWeight={500}>
            Alle Module abgeschlossen
          </Text>
          <Text fontSize="12px" color="var(--mute)" mt={1}>
            Hervorragend — das Onboarding ist vollständig.
          </Text>
        </Box>
      )}
    </Box>
  );
}
