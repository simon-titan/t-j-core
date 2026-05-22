'use client';

import { useState } from 'react';
import {
  Box, Text, HStack, SimpleGrid, VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Plus, Send, TrendingUp, CalendarDays, Bell, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { t as toast } from '@/lib/toast';
import type { PitchTrackerDefault } from '@/lib/types/database';
import type { TemplateWithStats, OrgMember, PitchStatus, TimeRange, LightRawData, DailyStatRow } from './types';
import { TemplateCard, NoTemplateCard, CreateTemplateCard } from './TemplateCard';
import { TeamPerformanceSection } from './TeamPerformanceSection';
import { CreateTemplateModal } from './CreateTemplateModal';
import { PitchTrackerLightView } from './PitchTrackerLightView';

const MotionBox = motion(Box);

// ─── KPI Config — forest-tinted icons, no rainbow ────────────────────────────

const KPI_CONFIG = [
  { label: 'Gesamt DMs',  unit: '',  Icon: Send,        iconBg: 'rgba(45,84,67,0.10)',  isDark: false },
  { label: 'Antwortrate', unit: '%', Icon: TrendingUp,   iconBg: 'rgba(74,124,92,0.10)', isDark: false },
  { label: 'Terminrate',  unit: '%', Icon: CalendarDays, iconBg: 'rgba(45,84,67,0.08)',  isDark: false },
  { label: 'Offene FUPs', unit: '',  Icon: Bell,         iconBg: 'rgba(74,124,92,0.25)', isDark: true  },
];

// ─── Time Range ───────────────────────────────────────────────────────────────

const TIME_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: '7 Tage',   value: '7d'  },
  { label: '30 Tage',  value: '30d' },
  { label: '90 Tage',  value: '90d' },
  { label: 'Gesamt',   value: 'all' },
];

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface NoTemplatePitch {
  id:      string;
  status:  PitchStatus;
  sent_at: string;
  sent_by: string;
  leads:   Array<{ id: string }>;
}

interface Props {
  templates:           TemplateWithStats[];
  noTemplatePitches:   NoTemplatePitch[];
  members:             OrgMember[];
  openFollowups:       number;
  userId:              string;
  orgId:               string;
  pitchTrackerDefault: PitchTrackerDefault;
  lightRawData:        LightRawData;
  manualStats:         DailyStatRow[];
}

const VIEW_OPTIONS: { value: PitchTrackerDefault; label: string }[] = [
  { value: 'detailed',      label: 'Detailliert'   },
  { value: 'light_auto',    label: 'Light · Auto'  },
  { value: 'light_manual',  label: 'Light · Manuell' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function PitchTrackerOverviewClient({
  templates: initialTemplates,
  noTemplatePitches,
  members,
  openFollowups,
  userId,
  orgId,
  pitchTrackerDefault,
  lightRawData,
  manualStats,
}: Props) {
  const [templates, setTemplates] = useState<TemplateWithStats[]>(initialTemplates);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [view, setView] = useState<PitchTrackerDefault>(pitchTrackerDefault);
  const [savedDefault, setSavedDefault] = useState<PitchTrackerDefault>(pitchTrackerDefault);
  const [savingDefault, setSavingDefault] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  async function handleSetDefault() {
    setSavingDefault(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('profiles') as any)
      .update({ pitch_tracker_default: view })
      .eq('id', userId);
    setSavingDefault(false);
    if (error) {
      toast.error('Standard konnte nicht gespeichert werden');
    } else {
      setSavedDefault(view);
      toast.success('Als Standard festgelegt');
    }
  }

  const allPitches = [
    ...templates.flatMap(t => t.pitches),
    ...noTemplatePitches,
  ];

  const filteredPitches = timeRange === 'all'
    ? allPitches
    : (() => {
        const days   = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return allPitches.filter(p => new Date(p.sent_at) >= cutoff);
      })();

  const totalPitches = filteredPitches.length;
  const answered     = filteredPitches.filter(p => p.status === 'answered').length;
  const withAppt     = filteredPitches.filter(p => p.leads?.length > 0).length;
  const answerRate   = totalPitches > 0 ? Math.round((answered / totalPitches) * 100) : 0;
  const apptRate     = totalPitches > 0 ? Math.round((withAppt / totalPitches) * 100) : 0;
  const kpiValues    = [totalPitches, answerRate, apptRate, openFollowups];

  function handleTemplateCreated(newTemplate: TemplateWithStats) {
    setTemplates(prev => [...prev, newTemplate]);
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
    >
      {/* ── Page Header ── */}
      <HStack justify="space-between" mb={8} align="flex-end">
        <Box>
          <Text
            fontFamily="var(--font-mono)"
            fontSize="10px"
            letterSpacing="0.18em"
            textTransform="uppercase"
            color="var(--mute)"
            mb={1}
          >
            — Varianten
          </Text>
          <Text
            fontFamily="var(--font-display)"
            fontStyle="italic"
            fontSize={{ base: '40px', md: '54px' }}
            lineHeight={0.9}
            letterSpacing="-0.03em"
            color="var(--ink)"
          >
            Pitch Tracker.
          </Text>
        </Box>

        {/* Variante anlegen — leaf-glow gradient per design system */}
        {view === 'detailed' && (
          <Box
            as="button"
            onClick={onOpen}
            display="flex"
            alignItems="center"
            gap="8px"
            px={5}
            h="42px"
            borderRadius="var(--radius-3)"
            background="linear-gradient(135deg, #2D5443 0%, #4A7C5C 100%)"
            color="white"
            fontFamily="var(--font-sans)"
            fontSize="13px"
            fontWeight={600}
            letterSpacing="0.01em"
            cursor="pointer"
            boxShadow="0 2px 12px rgba(45,84,67,0.25)"
            sx={{
              transition: 'all 180ms var(--ease-default)',
              '&:hover': {
                transform:  'translateY(-1px)',
                boxShadow: '0 4px 20px rgba(45,84,67,0.35)',
              },
              '&:active': { transform: 'translateY(0)' },
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            Variante anlegen
          </Box>
        )}
      </HStack>

      {/* ── View Switcher (Detailliert · Light Auto · Light Manuell) ── */}
      <HStack justify="space-between" align="center" mb={8} flexWrap="wrap" gap={3}>
        <HStack spacing={0} bg="var(--frost)" border="1px solid var(--mist)" borderRadius="var(--radius-2)" p="3px">
          {VIEW_OPTIONS.map(opt => (
            <Box
              as="button"
              key={opt.value}
              onClick={() => setView(opt.value)}
              px="16px"
              py="7px"
              borderRadius="5px"
              fontFamily="var(--font-display)"
              fontStyle={view === opt.value ? 'italic' : 'normal'}
              fontSize="13px"
              letterSpacing="-0.01em"
              fontWeight={view === opt.value ? 600 : 400}
              bg={view === opt.value ? 'var(--forest)' : 'transparent'}
              color={view === opt.value ? 'var(--paper)' : 'var(--mute)'}
              cursor="pointer"
              sx={{ transition: 'all 140ms var(--ease-default)' }}
              _hover={view !== opt.value ? { color: 'var(--forest)', bg: 'rgba(45,84,67,0.06)' } : {}}
            >
              {opt.label}
            </Box>
          ))}
        </HStack>

        <HStack spacing={2}>
          {view === savedDefault ? (
            <HStack spacing={1} color="var(--mute)">
              <Star size={13} strokeWidth={2} fill="var(--forest)" color="var(--forest)" />
              <Text fontFamily="var(--font-mono)" fontSize="10px" letterSpacing="0.10em" textTransform="uppercase">
                Standard
              </Text>
            </HStack>
          ) : (
            <Box
              as="button"
              onClick={handleSetDefault}
              display="flex"
              alignItems="center"
              gap="6px"
              px="12px"
              h="34px"
              borderRadius="var(--radius-2)"
              border="1px solid var(--mist)"
              bg="var(--paper)"
              color="var(--ink)"
              fontFamily="var(--font-sans)"
              fontSize="12px"
              fontWeight={500}
              cursor={savingDefault ? 'wait' : 'pointer'}
              opacity={savingDefault ? 0.6 : 1}
              _hover={{ borderColor: 'var(--forest)', color: 'var(--forest)' }}
              sx={{ transition: 'all 140ms var(--ease-default)' }}
            >
              <Star size={13} strokeWidth={2} />
              Als Standard
            </Box>
          )}
        </HStack>
      </HStack>

      {view !== 'detailed' && (
        <PitchTrackerLightView
          mode={view === 'light_auto' ? 'auto' : 'manual'}
          lightRawData={lightRawData}
          manualStats={manualStats}
          userId={userId}
          orgId={orgId}
        />
      )}

      {view === 'detailed' && (
      <>
      {/* ── Gesamt KPI Section ── */}
      <Box mb={9}>
        <HStack justify="space-between" align="center" mb={5}>
          <Text
            fontFamily="var(--font-mono)"
            fontSize="10px"
            letterSpacing="0.14em"
            textTransform="uppercase"
            color="var(--mute)"
          >
            Gesamt-Auswertung
          </Text>

          {/* Time Range — display font, forest selected, larger */}
          <HStack
            spacing={0}
            bg="var(--frost)"
            border="1px solid var(--mist)"
            borderRadius="var(--radius-2)"
            p="3px"
          >
            {TIME_OPTIONS.map(opt => (
              <Box
                as="button"
                key={opt.value}
                onClick={() => setTimeRange(opt.value)}
                px="16px"
                py="7px"
                borderRadius="5px"
                fontFamily="var(--font-display)"
                fontStyle={timeRange === opt.value ? 'italic' : 'normal'}
                fontSize="13px"
                letterSpacing="-0.01em"
                fontWeight={timeRange === opt.value ? 600 : 400}
                bg={timeRange === opt.value ? 'var(--forest)' : 'transparent'}
                color={timeRange === opt.value ? 'var(--paper)' : 'var(--mute)'}
                cursor="pointer"
                sx={{ transition: 'all 140ms var(--ease-default)' }}
                _hover={timeRange !== opt.value ? { color: 'var(--forest)', bg: 'rgba(45,84,67,0.06)' } : {}}
              >
                {opt.label}
              </Box>
            ))}
          </HStack>
        </HStack>

        {/* KPI Widgets — Dashboard Widget spec from design system */}
        <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4}>
          {KPI_CONFIG.map((kpi, i) => (
            <MotionBox
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1], delay: i * 0.07 } as never}
              background={kpi.isDark
                ? 'linear-gradient(160deg, #1F3A2E 0%, #122620 100%)'
                : 'rgba(248,248,250,0.85)'
              }
              backdropFilter={kpi.isDark ? undefined : 'blur(12px) saturate(1.4)'}
              border={kpi.isDark ? '1px solid rgba(74,124,92,0.18)' : '1px solid rgba(14,14,12,0.08)'}
              borderRadius="var(--radius-5)"
              p={6}
              boxShadow={kpi.isDark ? '0 4px 24px rgba(18,38,32,0.40)' : 'var(--shadow-cool-2)'}
              position="relative"
              overflow="hidden"
              sx={{ transition: 'all 180ms var(--ease-default)' }}
              _hover={{
                boxShadow: kpi.isDark ? '0 8px 32px rgba(18,38,32,0.55)' : 'var(--shadow-cool-3)',
                transform: 'translateY(-1px)',
              }}
            >
              {/* Top glow line — only on dark card */}
              {kpi.isDark && (
                <Box
                  position="absolute"
                  top={0} left={0} right={0} h="1px"
                  background="linear-gradient(90deg, transparent 0%, rgba(74,124,92,0.45) 50%, transparent 100%)"
                />
              )}

              {/* Corner accent */}
              <Box
                position="absolute"
                top={0} right={0}
                w="64px" h="64px"
                bg={kpi.isDark ? 'rgba(74,124,92,0.14)' : kpi.iconBg}
                borderRadius="0 var(--radius-5) 0 64px"
                opacity={0.7}
              />

              <VStack align="flex-start" spacing={3} position="relative">
                <Box
                  w="32px" h="32px"
                  bg={kpi.isDark ? 'rgba(74,124,92,0.22)' : kpi.iconBg}
                  border={kpi.isDark ? '1px solid rgba(74,124,92,0.32)' : '1px solid rgba(45,84,67,0.12)'}
                  borderRadius="var(--radius-2)"
                  display="flex" alignItems="center" justifyContent="center"
                >
                  <kpi.Icon
                    size={15}
                    strokeWidth={2}
                    color={kpi.isDark ? 'rgba(252,252,253,0.72)' : 'var(--forest)'}
                  />
                </Box>

                <Box>
                  <Text
                    fontFamily="var(--font-display)"
                    fontSize="38px"
                    fontStyle="italic"
                    lineHeight={1}
                    letterSpacing="-0.025em"
                    color={kpi.isDark ? 'var(--paper)' : 'var(--ink)'}
                  >
                    {kpiValues[i]}
                    {kpi.unit && (
                      <Text as="span" fontSize="20px" color={kpi.isDark ? 'rgba(252,252,253,0.45)' : 'var(--mute)'} ml="1px">{kpi.unit}</Text>
                    )}
                  </Text>
                  <Text
                    fontFamily="var(--font-mono)"
                    fontSize="9px"
                    letterSpacing="0.12em"
                    textTransform="uppercase"
                    color={kpi.isDark ? 'rgba(252,252,253,0.40)' : 'var(--mute)'}
                    mt={1}
                  >
                    {kpi.label}
                  </Text>
                </Box>
              </VStack>
            </MotionBox>
          ))}
        </SimpleGrid>
      </Box>

      {/* ── Team Performance ── */}
      <TeamPerformanceSection
        members={members}
        templates={templates}
        noTemplatePitches={noTemplatePitches}
        currentUserId={userId}
      />

      {/* ── Varianten Grid ── */}
      <Box mb={4}>
        <HStack spacing={2} mb={5}>
          <Text
            fontFamily="var(--font-mono)"
            fontSize="10px"
            letterSpacing="0.14em"
            textTransform="uppercase"
            color="var(--mute)"
          >
            Meine Varianten
          </Text>
          <Box
            px="8px"
            py="2px"
            bg="rgba(45,84,67,0.10)"
            border="1px solid rgba(45,84,67,0.20)"
            borderRadius="var(--radius-full)"
          >
            <Text fontFamily="var(--font-mono)" fontSize="9px" color="var(--forest)" fontWeight={700}>
              {templates.length}
            </Text>
          </Box>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {templates.map((tpl, i) => (
            <TemplateCard key={tpl.id} template={tpl} index={i} />
          ))}

          {noTemplatePitches.length > 0 && (
            <NoTemplateCard count={noTemplatePitches.length} index={templates.length} />
          )}

          <CreateTemplateCard onClick={onOpen} />
        </SimpleGrid>

        {templates.length === 0 && noTemplatePitches.length === 0 && (
          <Box py={16} textAlign="center">
            <Text
              fontFamily="var(--font-display)"
              fontStyle="italic"
              fontSize="24px"
              color="var(--mute)"
              letterSpacing="-0.01em"
            >
              Noch keine Varianten.
            </Text>
            <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--mute)" mt={2}>
              Lege deine erste Variante mit dem Button oben an.
            </Text>
          </Box>
        )}
      </Box>
      </>
      )}

      <CreateTemplateModal
        isOpen={isOpen}
        onClose={onClose}
        orgId={orgId}
        userId={userId}
        onCreated={handleTemplateCreated}
      />
    </MotionBox>
  );
}
