'use client';

import { useState, useMemo } from 'react';
import { Box, Text, HStack } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ModuleWithProgress } from './types';
import { ModuleCard } from './ModuleCard';

const MotionBox = motion(Box);

const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
};

const fadeInUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.65, 0, 0.35, 1] } },
};

type TypeFilter   = 'all' | 'workbook' | 'reference';
type StatusFilter = 'all' | 'not_started' | 'in_progress' | 'completed';

interface Props {
  modules:        ModuleWithProgress[];
  totalQuestions: number;
  totalAnswered:  number;
}

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all',         label: 'Alle' },
  { value: 'not_started', label: 'Offen' },
  { value: 'in_progress', label: 'Aktiv' },
  { value: 'completed',   label: 'Fertig' },
];

function SegmentButton({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Box
      as="button"
      onClick={onClick}
      px="16px"
      py="7px"
      borderRadius="var(--radius-full)"
      fontSize="12px"
      fontFamily="var(--font-sans)"
      fontWeight={active ? 600 : 400}
      cursor="pointer"
      transition="all 150ms var(--ease-default)"
      style={
        active
          ? { background: 'var(--ink)', color: 'var(--paper)', boxShadow: 'var(--shadow-1)' }
          : { background: 'transparent', color: 'rgba(14,14,12,0.50)' }
      }
      _hover={active ? {} : { color: 'var(--ink)' }}
    >
      {children}
    </Box>
  );
}

function StatusPill({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Box
      as="button"
      onClick={onClick}
      px="12px"
      py="5px"
      borderRadius="var(--radius-full)"
      border="1px solid"
      fontSize="11px"
      fontFamily="var(--font-sans)"
      fontWeight={active ? 500 : 400}
      cursor="pointer"
      transition="all 120ms var(--ease-default)"
      style={
        active
          ? { background: 'var(--forest)', color: 'var(--paper)', borderColor: 'var(--forest)' }
          : { background: 'transparent', color: 'rgba(14,14,12,0.50)', borderColor: 'var(--mist)' }
      }
      _hover={active ? {} : { borderColor: 'rgba(14,14,12,0.30)', color: 'var(--ink)' }}
    >
      {children}
    </Box>
  );
}

export function OnboardingOverviewClient({ modules, totalQuestions, totalAnswered }: Props) {
  const [activeType,   setActiveType]   = useState<TypeFilter>('all');
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('all');

  const totalPct = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  const workbooks  = useMemo(() => modules.filter((m) => m.type === 'workbook'),  [modules]);
  const references = useMemo(() => modules.filter((m) => m.type === 'reference'), [modules]);

  const filteredWorkbooks = useMemo(
    () => workbooks.filter((m) => activeStatus === 'all' || m.status === activeStatus),
    [workbooks, activeStatus]
  );
  const filteredReferences = useMemo(
    () => references.filter((m) => activeStatus === 'all' || m.status === activeStatus),
    [references, activeStatus]
  );

  const showWorkbooks  = activeType === 'all' || activeType === 'workbook';
  const showReferences = activeType === 'all' || activeType === 'reference';

  const completedModules = modules.filter((m) => m.status === 'completed').length;

  return (
    <Box>
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <Box
        bg="var(--forest-deep)"
        position="relative"
        overflow="hidden"
        mx={{ base: '-20px', md: '-32px' }}
        mt={{ base: '-20px', md: '-32px' }}
        px={{ base: 'var(--space-6)', md: 'var(--space-9)' }}
        pt={{ base: 'var(--space-8)', md: 'var(--space-10)' }}
        pb={{ base: 'var(--space-7)', md: 'var(--space-9)' }}
      >
        {/* Subtle radial glow */}
        <Box
          position="absolute"
          inset={0}
          pointerEvents="none"
          style={{
            background: 'radial-gradient(ellipse 55% 90% at 85% 50%, rgba(45,84,67,0.55) 0%, transparent 65%)',
          }}
        />

        <Box position="relative">
          {/* Kicker */}
          <MotionBox
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
          >
            <Text
              fontFamily="var(--font-mono)"
              fontSize="11px"
              fontWeight={500}
              letterSpacing="0.14em"
              textTransform="uppercase"
              color="var(--leaf)"
              mb="var(--space-5)"
            >
              — Onboarding
            </Text>
          </MotionBox>

          {/* Split: Heading left + Stat right */}
          <HStack
            align="flex-end"
            justify="space-between"
            gap="var(--space-7)"
            flexWrap={{ base: 'wrap', lg: 'nowrap' }}
          >
            <MotionBox
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1], delay: 0.05 }}
              flex={1}
            >
              <Text
                as="h1"
                fontFamily="var(--font-display)"
                fontStyle="italic"
                fontSize="clamp(44px, 6.5vw, 88px)"
                lineHeight={0.92}
                letterSpacing="-0.035em"
                color="var(--paper)"
              >
                Dein
                <br />
                Workbook
              </Text>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1], delay: 0.12 }}
              textAlign={{ base: 'left', lg: 'right' }}
              flexShrink={0}
            >
              <HStack align="baseline" gap="6px" justify={{ base: 'flex-start', lg: 'flex-end' }}>
                <Text
                  fontFamily="var(--font-display)"
                  fontStyle="italic"
                  fontSize="clamp(80px, 11vw, 130px)"
                  lineHeight={1}
                  letterSpacing="-0.04em"
                  color={totalPct > 0 ? 'var(--leaf)' : 'rgba(252,252,253,0.12)'}
                >
                  {totalPct}
                </Text>
                <Text
                  fontFamily="var(--font-mono)"
                  fontSize="clamp(22px, 3vw, 36px)"
                  color="rgba(252,252,253,0.30)"
                  lineHeight={1}
                >
                  %
                </Text>
              </HStack>
              <Text
                fontFamily="var(--font-sans)"
                fontSize="13px"
                color="rgba(252,252,253,0.60)"
                letterSpacing="0.01em"
                mt="var(--space-1)"
              >
                {totalAnswered} von {totalQuestions} Fragen · {completedModules} Module fertig
              </Text>
            </MotionBox>
          </HStack>

          {/* Progress bar */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.28 }}
            mt="var(--space-7)"
          >
            <Box h="2px" bg="rgba(252,252,253,0.10)" borderRadius="var(--radius-full)" overflow="hidden">
              <MotionBox
                h="100%"
                borderRadius="var(--radius-full)"
                style={{ background: 'var(--leaf)' }}
                initial={{ width: 0 }}
                animate={{ width: `${totalPct}%` }}
                transition={{ duration: 1.0, ease: [0.65, 0, 0.35, 1], delay: 0.4 }}
              />
            </Box>
          </MotionBox>
        </Box>

        {/* Chase Trail */}
        <Box position="absolute" bottom={0} left={0} right={0} h="1px" overflow="hidden">
          <MotionBox
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, var(--leaf) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
            }}
            initial={{ backgroundPosition: '200% 0' }}
            animate={{ backgroundPosition: '-200% 0' }}
            transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.55 }}
          />
        </Box>
      </Box>

      {/* ─── TOOLBAR ──────────────────────────────────────────────────────── */}
      <Box
        py="var(--space-5)"
        borderBottom="1px solid var(--mist)"
      >
        <HStack gap="var(--space-5)" flexWrap="wrap" align="center">
          {/* Type segmented control */}
          <Box
            bg="var(--frost)"
            borderRadius="var(--radius-full)"
            border="1px solid var(--mist)"
            p="3px"
            display="inline-flex"
            gap="2px"
          >
            {(['all', 'workbook', 'reference'] as TypeFilter[]).map((v) => (
              <SegmentButton key={v} active={activeType === v} onClick={() => setActiveType(v)}>
                {v === 'all' ? 'Alle' : v === 'workbook' ? 'Workbooks' : 'References'}
              </SegmentButton>
            ))}
          </Box>

          <Box w="1px" h="20px" bg="var(--mist)" flexShrink={0} display={{ base: 'none', sm: 'block' }} />

          <HStack gap="var(--space-2)" flexWrap="wrap">
            {STATUS_FILTERS.map((f) => (
              <StatusPill
                key={f.value}
                active={activeStatus === f.value}
                onClick={() => setActiveStatus(f.value)}
              >
                {f.label}
              </StatusPill>
            ))}
          </HStack>
        </HStack>
      </Box>

      {/* ─── MODULE SECTIONS ──────────────────────────────────────────────── */}
      <Box py="var(--space-8)">
        <AnimatePresence mode="wait">
          <MotionBox
            key={`${activeType}-${activeStatus}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
          >
            {/* ── Workbooks ── */}
            {showWorkbooks && filteredWorkbooks.length > 0 && (
              <Box mb="var(--space-10)">
                <HStack mb="var(--space-5)" align="center" justify="space-between">
                  <HStack align="baseline" gap="var(--space-3)">
                    <Text
                      fontFamily="var(--font-mono)"
                      fontSize="10px"
                      fontWeight={600}
                      letterSpacing="0.14em"
                      textTransform="uppercase"
                      color="var(--forest)"
                    >
                      — Workbooks
                    </Text>
                    <Box w="1px" h="11px" bg="var(--mist)" />
                    <Text fontFamily="var(--font-sans)" fontSize="12px" color="rgba(14,14,12,0.45)">
                      {filteredWorkbooks.length} Module
                    </Text>
                  </HStack>
                </HStack>

                {/* Bento CSS Grid — first card spans 2 cols on md+ */}
                <MotionBox
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  display="grid"
                  gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }}
                  gap="var(--space-5)"
                >
                  {filteredWorkbooks.map((mod, i) => {
                    const isFeatured = i === 0 && filteredWorkbooks.length > 1;
                    return (
                      <MotionBox
                        key={mod.id}
                        variants={fadeInUp}
                        gridColumn={{
                          base: '1',
                          md:   isFeatured ? 'span 2' : 'span 1',
                          xl:   isFeatured ? 'span 2' : 'span 1',
                        }}
                        h="100%"
                      >
                        <ModuleCard module={mod} size="large" featured={isFeatured} index={i} />
                      </MotionBox>
                    );
                  })}
                </MotionBox>
              </Box>
            )}

            {/* ── References ── */}
            {showReferences && filteredReferences.length > 0 && (
              <Box>
                <HStack mb="var(--space-5)" align="baseline" gap="var(--space-3)">
                  <Text
                    fontFamily="var(--font-mono)"
                    fontSize="10px"
                    fontWeight={600}
                    letterSpacing="0.14em"
                    textTransform="uppercase"
                    color="rgba(14,14,12,0.40)"
                  >
                    — References
                  </Text>
                  <Box w="1px" h="11px" bg="var(--mist)" />
                  <Text fontFamily="var(--font-sans)" fontSize="12px" color="rgba(14,14,12,0.40)">
                    {filteredReferences.length} Module
                  </Text>
                </HStack>

                <MotionBox
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  display="grid"
                  gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }}
                  gap="var(--space-4)"
                >
                  {filteredReferences.map((mod, i) => (
                    <MotionBox key={mod.id} variants={fadeInUp} h="100%">
                      <ModuleCard module={mod} size="compact" index={i} />
                    </MotionBox>
                  ))}
                </MotionBox>
              </Box>
            )}

            {/* Empty state */}
            {filteredWorkbooks.length === 0 && filteredReferences.length === 0 && (
              <Box
                textAlign="center"
                py="var(--space-10)"
                color="rgba(14,14,12,0.40)"
                fontFamily="var(--font-sans)"
                fontSize="14px"
              >
                Keine Module für diesen Filter.
              </Box>
            )}
          </MotionBox>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
