'use client';

import { Box, Text, HStack, VStack, SimpleGrid } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Plus } from 'lucide-react';
import type { TemplateWithStats, PitchStatus } from './types';

const MotionBox = motion(Box);

// ─── Design System: Module Card Spec ─────────────────────────────────────────
// bg: var(--frost), border: var(--mist), radius: --radius-3 (8px)
// hover: translateY(-2px), shadow-2, --mute border
// accent line: 2px solid var(--forest) left (in-progress state)
// hover-glow overlay: radial-gradient(circle at 50% 0%, rgba(74,124,92,0.08) 0%, transparent 60%)

// Status activity bar colors — forest-toned
const STATUS_COLORS: Record<PitchStatus, string> = {
  sent:      'rgba(45,84,67,0.18)',
  delivered: 'rgba(74,124,92,0.45)',
  answered:  'var(--forest)',
  ignored:   'rgba(14,14,12,0.10)',
  bounced:   'rgba(153,27,27,0.35)',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeStats(pitches: TemplateWithStats['pitches']) {
  const total    = pitches.length;
  const answered = pitches.filter(p => p.status === 'answered').length;
  const withAppt = pitches.filter(p => (p.leads?.length ?? 0) > 0).length;
  const pendingFups = pitches.reduce(
    (sum, p) => sum + (p.followups?.filter(f => f.status === 'pending').length ?? 0), 0
  );
  return {
    total,
    pendingFups,
    answerRate: total > 0 ? Math.round((answered / total) * 100) : 0,
    apptRate:   total > 0 ? Math.round((withAppt / total) * 100) : 0,
  };
}

function StatWidget({ label, value, unit = '', highlight }: {
  label: string; value: number; unit?: string; highlight?: boolean;
}) {
  return (
    <Box minW={0} overflow="hidden">
      <Text
        fontFamily="var(--font-mono)"
        fontSize="9px"
        letterSpacing="0.12em"
        textTransform="uppercase"
        color="var(--mute)"
        mb="3px"
        noOfLines={1}
      >
        {label}
      </Text>
      <Text
        fontFamily="var(--font-display)"
        fontStyle="italic"
        fontSize="24px"
        lineHeight={1}
        letterSpacing="-0.02em"
        color={highlight && value > 0 ? 'var(--forest)' : 'var(--ink)'}
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="clip"
      >
        {value}
        {unit && <Text as="span" fontSize="13px" color="var(--mute)">{unit}</Text>}
      </Text>
    </Box>
  );
}

function MiniBar({ pitches }: { pitches: TemplateWithStats['pitches'] }) {
  if (pitches.length === 0) return null;
  return (
    <HStack spacing="2px" h="3px" w="full">
      {pitches.slice(0, 40).map((p, i) => (
        <Box
          key={i}
          flex={1}
          h="full"
          bg={STATUS_COLORS[p.status] ?? STATUS_COLORS.sent}
          borderRadius="full"
        />
      ))}
    </HStack>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

interface CardProps  { template: TemplateWithStats; index: number }
interface CreateProps { onClick: () => void }

export function TemplateCard({ template, index }: CardProps) {
  const router  = useRouter();
  const stats   = computeStats(template.pitches);
  const hasFups = stats.pendingFups > 0;

  return (
    <MotionBox
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1], delay: index * 0.06 } as never}
      position="relative"
      overflow="hidden"
      bg="var(--frost)"
      border="1px solid var(--mist)"
      borderLeft="2px solid var(--forest)"
      borderRadius="var(--radius-3)"
      p={5}
      cursor="pointer"
      role="group"
      sx={{
        transition: 'box-shadow var(--duration-base) var(--ease-default), border-color var(--duration-base) var(--ease-default), transform var(--duration-base) var(--ease-default)',
        '&:hover': {
          boxShadow:   'var(--shadow-2)',
          borderColor: 'var(--mute)',
          borderLeftColor: 'var(--forest)',
          transform:   'translateY(-2px)',
        },
      }}
      onClick={() => router.push(`/app/pitch-tracker/${template.id}`)}
    >
      {/* Hover glow — gradient-hover-glow from design system */}
      <Box
        position="absolute"
        inset={0}
        background="radial-gradient(circle at 50% 0%, rgba(74,124,92,0.08) 0%, transparent 60%)"
        opacity={0}
        sx={{ transition: 'opacity var(--duration-base) var(--ease-default)' }}
        _groupHover={{ opacity: 1 }}
        pointerEvents="none"
      />

      <VStack align="stretch" spacing={4} position="relative">
        {/* Header */}
        <HStack justify="space-between" align="flex-start">
          <Box flex={1} minW={0} pr={2}>
            <Text
              fontFamily="var(--font-mono)"
              fontSize="9px"
              letterSpacing="0.14em"
              textTransform="uppercase"
              color="var(--mute)"
              mb={1}
            >
              Variante
            </Text>
            <Text
              fontFamily="var(--font-display)"
              fontStyle="italic"
              fontSize="21px"
              lineHeight={1.1}
              letterSpacing="-0.02em"
              color="var(--ink)"
              noOfLines={1}
            >
              {template.name}
            </Text>
          </Box>

          <VStack spacing={2} align="flex-end" flexShrink={0} mt={1}>
            {/* Pending FUPs badge — inverted forest pill */}
            {hasFups && (
              <HStack
                spacing="4px"
                px="8px"
                py="4px"
                bg="var(--forest)"
                borderRadius="var(--radius-full)"
              >
                <Clock size={9} strokeWidth={2} color="rgba(252,252,253,0.65)" />
                <Text
                  fontFamily="var(--font-mono)"
                  fontSize="10px"
                  letterSpacing="0.04em"
                  color="var(--paper)"
                  fontWeight={600}
                >
                  {stats.pendingFups} FUP{stats.pendingFups !== 1 ? 's' : ''}
                </Text>
              </HStack>
            )}

            {!template.is_active && (
              <Box px="7px" py="2px" bg="var(--mist)" borderRadius="var(--radius-full)">
                <Text fontFamily="var(--font-mono)" fontSize="9px" color="var(--mute)">INAKTIV</Text>
              </Box>
            )}
          </VStack>
        </HStack>

        {/* Target Audience Tag */}
        {template.target_audience && (
          <Box
            display="inline-flex"
            w="fit-content"
            px="8px"
            py="3px"
            bg="rgba(45,84,67,0.08)"
            border="1px solid rgba(45,84,67,0.18)"
            borderRadius="var(--radius-full)"
          >
            <Text fontFamily="var(--font-sans)" fontSize="11px" color="var(--forest)" fontWeight={500}>
              {template.target_audience}
            </Text>
          </Box>
        )}

        {/* Stats */}
        <SimpleGrid columns={3} spacing={3}>
          <StatWidget label="Pitches"  value={stats.total}      highlight />
          <StatWidget label="Antw."    value={stats.answerRate} unit="%" />
          <StatWidget label="Termin"   value={stats.apptRate}   unit="%" />
        </SimpleGrid>

        {/* Activity bar + arrow hint */}
        <Box>
          <MiniBar pitches={template.pitches} />
          <HStack
            justify="flex-end"
            mt={2}
            opacity={0}
            sx={{ transition: 'opacity 160ms ease' }}
            _groupHover={{ opacity: 1 }}
          >
            <Text fontFamily="var(--font-sans)" fontSize="11px" color="var(--forest)" fontWeight={500}>
              Öffnen
            </Text>
            <ArrowRight size={11} strokeWidth={2.5} color="var(--forest)" />
          </HStack>
        </Box>
      </VStack>
    </MotionBox>
  );
}

// ─── No-Template Card ─────────────────────────────────────────────────────────

export function NoTemplateCard({ count, index }: { count: number; index: number }) {
  const router = useRouter();

  return (
    <MotionBox
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1], delay: index * 0.06 } as never}
      bg="var(--frost)"
      border="1px dashed rgba(14,14,12,0.18)"
      borderRadius="var(--radius-3)"
      p={5}
      cursor="pointer"
      role="group"
      sx={{
        transition: 'all var(--duration-base) var(--ease-default)',
        '&:hover': {
          borderColor: 'var(--mute)',
          bg:          'var(--paper)',
          transform:   'translateY(-2px)',
          boxShadow:   'var(--shadow-1)',
        },
      }}
      onClick={() => router.push('/app/pitch-tracker/no-template')}
    >
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text
            fontFamily="var(--font-mono)"
            fontSize="9px"
            letterSpacing="0.14em"
            textTransform="uppercase"
            color="var(--mute)"
            mb={1}
          >
            Ohne Variante
          </Text>
          <Text
            fontFamily="var(--font-display)"
            fontStyle="italic"
            fontSize="21px"
            lineHeight={1.1}
            letterSpacing="-0.02em"
            color="var(--mute)"
          >
            Unkategorisiert
          </Text>
        </Box>
        <SimpleGrid columns={3} spacing={3}>
          <StatWidget label="Pitches" value={count} />
          <Box /><Box />
        </SimpleGrid>
      </VStack>
    </MotionBox>
  );
}

// ─── Create Variante Card — gradient-forest-card (design system dark forest) ──

export function CreateTemplateCard({ onClick }: CreateProps) {
  return (
    <Box
      onClick={onClick}
      cursor="pointer"
      borderRadius="var(--radius-3)"
      position="relative"
      overflow="hidden"
      minH="200px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      // gradient-forest-card from design system
      background="linear-gradient(180deg, #1F3A2E 0%, #122620 100%)"
      role="group"
      sx={{
        transition: 'all var(--duration-base) var(--ease-default)',
        '&:hover': {
          transform:  'translateY(-2px)',
          boxShadow: 'var(--shadow-3)',
        },
      }}
    >
      {/* Subtle glow line at top — matches card-featured spec */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="1px"
        background="linear-gradient(90deg, transparent 0%, rgba(74,124,92,0.40) 50%, transparent 100%)"
      />

      {/* Subtle decorative circle */}
      <Box
        position="absolute"
        bottom="-40px"
        right="-40px"
        w="120px"
        h="120px"
        borderRadius="full"
        bg="rgba(74,124,92,0.08)"
      />

      <VStack spacing={3} position="relative" zIndex={1} align="center">
        <Box
          w="44px"
          h="44px"
          bg="rgba(74,124,92,0.15)"
          border="1px solid rgba(74,124,92,0.25)"
          borderRadius="var(--radius-2)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ transition: 'all var(--duration-base) var(--ease-default)' }}
          _groupHover={{ bg: 'rgba(74,124,92,0.22)' }}
        >
          <Plus size={20} strokeWidth={2} color="var(--paper)" />
        </Box>

        <Box textAlign="center">
          <Text
            fontFamily="var(--font-display)"
            fontStyle="italic"
            fontSize="18px"
            letterSpacing="-0.01em"
            color="var(--paper)"
            lineHeight={1.2}
          >
            Neue Variante
          </Text>
          <Text
            fontFamily="var(--font-mono)"
            fontSize="9px"
            letterSpacing="0.10em"
            textTransform="uppercase"
            color="rgba(252,252,253,0.45)"
            mt={1}
          >
            Pitch-Template anlegen
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
