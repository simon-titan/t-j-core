'use client';

import { useRouter } from 'next/navigation';
import { Box, Text, HStack, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  BookOpen, Target, Users, Zap, RotateCcw,
  Globe, FileText, TrendingUp, CheckSquare, CheckCircle2,
  ShieldCheck, Briefcase, MessageSquare, ArrowRight,
  Mic, PhoneCall,
} from 'lucide-react';
import type { ModuleWithProgress } from './types';

const MotionBox = motion(Box);

const ICON_MAP: Record<string, React.ElementType> = {
  'angebot':                        Briefcase,
  'zielgruppenanalyse':             Target,
  'linkedin-profil-optimierung':    Users,
  'linkedin-outreach-workbook':     MessageSquare,
  'direct-pitch':                   Zap,
  'follow-up-system':               RotateCcw,
  'netzwerkaufbau':                 Globe,
  'content-plan':                   FileText,
  'sales':                          TrendingUp,
  'closing-skript-1':               CheckSquare,
  'closing-skript-2':               CheckCircle2,
  'closing-skript-1-call':          Mic,
  'closing-skript-2-call':          PhoneCall,
  'einwandbehandlung':              ShieldCheck,
};

// Subtle background variation per card index (keeps grid from looking monotonous)
const BG_VARIANTS = [
  'var(--frost)',
  'var(--paper)',
  'rgba(31,58,46,0.035)',
  'var(--frost)',
  'var(--paper)',
];

interface Props {
  module:    ModuleWithProgress;
  size?:     'large' | 'compact';
  featured?: boolean;
  index?:    number;
}

export function ModuleCard({ module, size = 'large', featured = false, index = 0 }: Props) {
  const router     = useRouter();
  const Icon       = ICON_MAP[module.slug] ?? BookOpen;
  const isCompleted  = module.status === 'completed';
  const isInProgress = module.status === 'in_progress';

  const handleClick = () => router.push(`/app/onboarding/${module.slug}`);

  // ── FEATURED CARD (first workbook, full-width, horizontal, always dark) ──
  if (featured) {
    return (
      <MotionBox
        as="article"
        bg="var(--forest-deep)"
        borderRadius="var(--radius-4)"
        p={{ base: 'var(--space-6)', md: 'var(--space-8)' }}
        cursor="pointer"
        position="relative"
        overflow="hidden"
        h="100%"
        minH={{ base: '180px', md: '200px' }}
        onClick={handleClick}
        whileHover={{ y: -3, boxShadow: '0 16px 50px rgba(18,38,32,0.25)' }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        style={{ boxShadow: '0 4px 24px rgba(18,38,32,0.20)' }}
        role="group"
      >
        {/* Background glow */}
        <Box
          position="absolute"
          inset={0}
          pointerEvents="none"
          style={{
            background: 'radial-gradient(ellipse 60% 100% at 95% 50%, rgba(45,84,67,0.55) 0%, transparent 65%)',
          }}
        />
        {isCompleted && (
          <Box
            position="absolute"
            inset={0}
            pointerEvents="none"
            style={{
              background: 'radial-gradient(ellipse 40% 70% at 90% 50%, rgba(74,124,92,0.20) 0%, transparent 60%)',
            }}
          />
        )}

        <HStack
          position="relative"
          align="center"
          justify="space-between"
          gap={{ base: 'var(--space-5)', md: 'var(--space-8)' }}
          h="100%"
          flexWrap={{ base: 'wrap', md: 'nowrap' }}
        >
          {/* ── Left: content ── */}
          <VStack align="flex-start" gap="var(--space-3)" flex={1} minW={0}>
            <HStack gap="var(--space-3)" align="center">
              <Box
                w="52px"
                h="52px"
                borderRadius="var(--radius-3)"
                bg="rgba(252,252,253,0.10)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Icon size={26} strokeWidth={1.5} color="var(--leaf)" />
              </Box>
              <Box>
                <Text
                  fontFamily="var(--font-mono)"
                  fontSize="10px"
                  fontWeight={500}
                  letterSpacing="0.12em"
                  textTransform="uppercase"
                  color="rgba(252,252,253,0.50)"
                  mb="2px"
                >
                  {isCompleted ? '— Abgeschlossen' : isInProgress ? '— In Bearbeitung' : '— Workbook'}
                </Text>
                <Text
                  fontFamily="var(--font-display)"
                  fontStyle="italic"
                  fontSize={{ base: '22px', md: '28px' }}
                  fontWeight={600}
                  color="var(--paper)"
                  letterSpacing="-0.025em"
                  lineHeight={1.1}
                  noOfLines={2}
                >
                  {module.title}
                </Text>
              </Box>
            </HStack>

            <HStack gap="var(--space-4)" align="center" flexWrap="wrap">
              <Text
                fontFamily="var(--font-sans)"
                fontSize="13px"
                color="rgba(252,252,253,0.55)"
              >
                {module.answeredQuestions} von {module.totalQuestions} Fragen beantwortet
              </Text>
              {isCompleted && (
                <HStack gap="5px">
                  <CheckCircle2 size={12} strokeWidth={2} color="var(--leaf)" />
                  <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--leaf)" fontWeight={500}>
                    Fertig
                  </Text>
                </HStack>
              )}
            </HStack>

            {/* Progress bar */}
            <Box w="100%" maxW="300px" h="2px" bg="rgba(252,252,253,0.10)" borderRadius="var(--radius-full)" overflow="hidden">
              <Box
                h="100%"
                borderRadius="var(--radius-full)"
                style={{
                  width: `${module.percentage}%`,
                  background: 'var(--leaf)',
                  transition: 'width 700ms cubic-bezier(0.65,0,0.35,1)',
                }}
              />
            </Box>
          </VStack>

          {/* ── Right: big stat ── */}
          <Box
            textAlign="right"
            flexShrink={0}
            display="flex"
            flexDir="column"
            alignItems="flex-end"
            gap="var(--space-2)"
          >
            <HStack align="baseline" gap="4px">
              <Text
                fontFamily="var(--font-display)"
                fontStyle="italic"
                fontSize={{ base: '64px', md: '88px' }}
                lineHeight={1}
                letterSpacing="-0.04em"
                color={module.percentage > 0 ? 'var(--leaf)' : 'rgba(252,252,253,0.10)'}
              >
                {module.percentage}
              </Text>
              <Text
                fontFamily="var(--font-mono)"
                fontSize={{ base: '18px', md: '24px' }}
                color="rgba(252,252,253,0.25)"
                lineHeight={1}
              >
                %
              </Text>
            </HStack>

            {/* Arrow CTA */}
            <HStack
              gap="6px"
              color="rgba(252,252,253,0.45)"
              transition="color 150ms"
              _groupHover={{ color: 'var(--leaf)' }}
            >
              <Text fontFamily="var(--font-sans)" fontSize="12px" fontWeight={500}>
                Öffnen
              </Text>
              <ArrowRight size={14} strokeWidth={1.5} />
            </HStack>
          </Box>
        </HStack>
      </MotionBox>
    );
  }

  // ── COMPACT CARD (References) ──────────────────────────────────────────
  if (size === 'compact') {
    const cardBg = isCompleted ? 'var(--ink)' : BG_VARIANTS[index % BG_VARIANTS.length];

    return (
      <MotionBox
        as="article"
        bg={cardBg}
        borderTop={`1px solid ${isCompleted ? 'rgba(252,252,253,0.08)' : 'var(--mist)'}`}
        borderRight={`1px solid ${isCompleted ? 'rgba(252,252,253,0.08)' : 'var(--mist)'}`}
        borderBottom={`1px solid ${isCompleted ? 'rgba(252,252,253,0.08)' : 'var(--mist)'}`}
        borderLeft={`3px solid ${isInProgress ? 'var(--forest)' : isCompleted ? 'var(--leaf)' : 'transparent'}`}
        borderRadius="var(--radius-3)"
        p="var(--space-5)"
        cursor="pointer"
        h="100%"
        onClick={handleClick}
        whileHover={{ y: -2, boxShadow: 'var(--shadow-2)' }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        style={{ boxShadow: 'var(--shadow-1)' }}
        role="group"
      >
        <HStack justify="space-between" mb="var(--space-3)" align="flex-start">
          <Box
            w="32px" h="32px"
            borderRadius="var(--radius-2)"
            bg={isCompleted ? 'rgba(252,252,253,0.10)' : 'rgba(74,124,92,0.12)'}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Icon size={15} strokeWidth={1.5} color={isCompleted ? 'var(--leaf)' : 'var(--forest)'} />
          </Box>
          {isCompleted && <CheckCircle2 size={13} strokeWidth={2} color="var(--leaf)" />}
        </HStack>

        <Text
          fontFamily="var(--font-sans)"
          fontSize="13px"
          fontWeight={500}
          color={isCompleted ? 'var(--paper)' : 'var(--ink)'}
          letterSpacing="-0.01em"
          lineHeight={1.35}
          mb="var(--space-3)"
          noOfLines={2}
        >
          {module.title}
        </Text>

        <Box h="2px" bg={isCompleted ? 'rgba(252,252,253,0.10)' : 'var(--mist)'} borderRadius="var(--radius-full)" mb="var(--space-2)">
          <Box
            h="100%"
            borderRadius="var(--radius-full)"
            style={{
              width: `${module.percentage}%`,
              background: isCompleted ? 'var(--leaf)' : 'var(--gradient-leaf-glow)',
              transition: 'width 600ms cubic-bezier(0.65,0,0.35,1)',
            }}
          />
        </Box>

        <Text fontFamily="var(--font-sans)" fontSize="11px" color={isCompleted ? 'rgba(252,252,253,0.40)' : 'rgba(14,14,12,0.50)'}>
          {module.answeredQuestions}/{module.totalQuestions} Fragen
        </Text>
      </MotionBox>
    );
  }

  // ── LARGE CARD (Workbooks, non-featured) ──────────────────────────────
  const cardBg       = isCompleted ? 'var(--ink)' : BG_VARIANTS[index % BG_VARIANTS.length];
  const leftColor    = isCompleted ? 'var(--leaf)' : isInProgress ? 'var(--forest)' : 'transparent';
  const sideColor    = isCompleted ? 'rgba(252,252,253,0.08)' : 'var(--mist)';

  return (
    <MotionBox
      as="article"
      bg={cardBg}
      borderTop={`1px solid ${sideColor}`}
      borderRight={`1px solid ${sideColor}`}
      borderBottom={`1px solid ${sideColor}`}
      borderLeft={`3px solid ${leftColor}`}
      borderRadius="var(--radius-4)"
      p="var(--space-6)"
      cursor="pointer"
      position="relative"
      overflow="hidden"
      h="100%"
      onClick={handleClick}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(18,38,32,0.14)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      style={{ boxShadow: 'var(--shadow-1)' }}
      role="group"
    >
      {/* Top row: Icon + Percentage */}
      <HStack justify="space-between" align="flex-start" mb="var(--space-5)">
        <Box
          w="44px" h="44px"
          borderRadius="var(--radius-3)"
          bg={isCompleted ? 'rgba(252,252,253,0.10)' : 'rgba(74,124,92,0.12)'}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <Icon size={22} strokeWidth={1.5} color={isCompleted ? 'var(--leaf)' : 'var(--forest)'} />
        </Box>

        <HStack align="baseline" gap="2px">
          <Text
            fontFamily="var(--font-display)"
            fontStyle="italic"
            fontSize="clamp(24px, 3vw, 38px)"
            lineHeight={1}
            letterSpacing="-0.03em"
            color={
              isCompleted
                ? 'var(--leaf)'
                : module.percentage > 0
                ? 'var(--forest)'
                : 'rgba(14,14,12,0.12)'
            }
          >
            {module.percentage}
          </Text>
          <Text
            fontFamily="var(--font-mono)"
            fontSize="11px"
            color={isCompleted ? 'rgba(252,252,253,0.35)' : 'rgba(14,14,12,0.30)'}
          >
            %
          </Text>
        </HStack>
      </HStack>

      {/* Title */}
      <Text
        fontFamily="var(--font-display)"
        fontSize="18px"
        fontWeight={600}
        color={isCompleted ? 'var(--paper)' : 'var(--ink)'}
        letterSpacing="-0.02em"
        lineHeight={1.2}
        mb="var(--space-2)"
        noOfLines={2}
      >
        {module.title}
      </Text>

      {/* Question count */}
      <Text
        fontFamily="var(--font-sans)"
        fontSize="12px"
        color={isCompleted ? 'rgba(252,252,253,0.40)' : 'rgba(14,14,12,0.50)'}
        mb="var(--space-5)"
      >
        {module.answeredQuestions} von {module.totalQuestions} Fragen
      </Text>

      {/* Progress bar */}
      <Box h="3px" bg={isCompleted ? 'rgba(252,252,253,0.10)' : 'var(--mist)'} borderRadius="var(--radius-full)" mb="var(--space-5)">
        <Box
          h="100%"
          borderRadius="var(--radius-full)"
          style={{
            width: `${module.percentage}%`,
            background: isCompleted ? 'var(--leaf)' : 'var(--gradient-leaf-glow)',
            transition: 'width 600ms cubic-bezier(0.65,0,0.35,1)',
          }}
        />
      </Box>

      {/* Footer */}
      <HStack justify="space-between" align="center">
        <Box
          display="inline-flex"
          alignItems="center"
          gap="5px"
          px="10px"
          py="4px"
          borderRadius="var(--radius-full)"
          border="1px solid"
          style={
            isCompleted
              ? { background: 'rgba(74,124,92,0.20)', borderColor: 'rgba(74,124,92,0.30)', color: 'var(--leaf)' }
              : isInProgress
              ? { background: 'rgba(74,124,92,0.10)', borderColor: 'rgba(74,124,92,0.20)', color: 'var(--forest)' }
              : { background: 'transparent', borderColor: 'var(--mist)', color: 'rgba(14,14,12,0.45)' }
          }
        >
          {isCompleted && <CheckCircle2 size={11} strokeWidth={2} />}
          <Text fontFamily="var(--font-sans)" fontSize="11px" fontWeight={isInProgress || isCompleted ? 500 : 400} letterSpacing="0.03em">
            {isCompleted ? 'Abgeschlossen' : isInProgress ? 'In Bearbeitung' : 'Nicht begonnen'}
          </Text>
        </Box>

        <Box
          opacity={0}
          transform="translateX(-4px)"
          transition="opacity 180ms, transform 180ms"
          color={isCompleted ? 'var(--leaf)' : 'var(--forest)'}
          _groupHover={{ opacity: 1, transform: 'translateX(0)' }}
          display="flex"
          alignItems="center"
        >
          <ArrowRight size={15} strokeWidth={1.5} />
        </Box>
      </HStack>
    </MotionBox>
  );
}
