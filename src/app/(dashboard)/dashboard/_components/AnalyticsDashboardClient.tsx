'use client';

import { useState, useMemo } from 'react';
import { Box, Text, HStack, Grid, GridItem } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type {
  AnalyticsData,
  TimeRange,
  MemberMetrics,
  TemplateMetrics,
  DailyDmPoint,
  AnalyticsTotals,
  PitchSummary,
  DealSummary,
} from './types';
import { KPICards }                  from './KPICards';
import { DmsPerDayChart }            from './DmsPerDayChart';
import { AnswerRateByTemplateChart } from './AnswerRateByTemplateChart';
import { FunnelChart }               from './FunnelChart';
import { TemplatePerformanceTable }  from './TemplatePerformanceTable';
import { TeamTable }                 from './TeamTable';
import { MemberDetailModal }         from './MemberDetailModal';

const MotionBox = motion(Box);

const TIME_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: '7 Tage',  value: '7d' },
  { label: '30 Tage', value: '30d' },
  { label: '90 Tage', value: '90d' },
  { label: 'Custom',  value: 'custom' },
];

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function getDateRange(
  range: TimeRange,
  customStart: string,
  customEnd: string,
): { since: string; until: string } {
  if (range === 'custom') return { since: customStart, until: customEnd };
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  return { since: daysAgoStr(days), until: todayStr() };
}

interface Computed {
  totals:    AnalyticsTotals;
  members:   MemberMetrics[];
  templates: TemplateMetrics[];
  daily:     DailyDmPoint[];
}

function compute(
  pitches:   PitchSummary[],
  deals:     DealSummary[],
  members:   AnalyticsData['members'],
  templates: AnalyticsData['templates'],
  since:     string,
  until:     string,
): Computed {
  const fp = pitches.filter(p => p.sentAt >= since && p.sentAt <= until);
  const fd = deals.filter(
    d => d.createdAt >= since && d.createdAt <= until && d.stage === 'closed_won',
  );

  // Daily DMs
  const dailyMap = new Map<string, number>();
  for (const p of fp) {
    dailyMap.set(p.sentAt, (dailyMap.get(p.sentAt) ?? 0) + 1);
  }
  const daily: DailyDmPoint[] = Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Totals
  const answered     = fp.filter(p => p.status === 'answered').length;
  const appointments = fp.filter(p => p.hasAppointment).length;
  const totals: AnalyticsTotals = {
    dms:          fp.length,
    answered,
    appointments,
    deals:        fd.length,
    dealValue:    fd.reduce((s, d) => s + d.value, 0),
  };

  // Per-member metrics
  const memberMetrics: MemberMetrics[] = members.map(m => {
    const mine        = fp.filter(p => p.sentBy === m.userId);
    const memberDeals = fd.filter(d => d.assignedTo === m.userId);

    const mDailyMap = new Map<string, number>();
    for (const p of mine) {
      mDailyMap.set(p.sentAt, (mDailyMap.get(p.sentAt) ?? 0) + 1);
    }
    const dailyDms: DailyDmPoint[] = Array.from(mDailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      userId:       m.userId,
      fullName:     m.fullName,
      avatarUrl:    m.avatarUrl,
      dms:          mine.length,
      answered:     mine.filter(p => p.status === 'answered').length,
      appointments: mine.filter(p => p.hasAppointment).length,
      deals:        memberDeals.length,
      dealValue:    memberDeals.reduce((s, d) => s + d.value, 0),
      dailyDms,
    };
  });

  // Template metrics
  const tMap    = new Map(templates.map(t => [t.templateId, t.name]));
  const tGroups = new Map<string, PitchSummary[]>();
  for (const p of fp) {
    const key = p.templateId ?? '__none__';
    if (!tGroups.has(key)) tGroups.set(key, []);
    tGroups.get(key)!.push(p);
  }

  const templateMetrics: TemplateMetrics[] = [];
  for (const [tid, tPitches] of tGroups.entries()) {
    if (tid === '__none__') continue;
    const dms   = tPitches.length;
    const ans   = tPitches.filter(p => p.status === 'answered').length;
    const appts = tPitches.filter(p => p.hasAppointment).length;
    templateMetrics.push({
      templateId:   tid,
      name:         tMap.get(tid) ?? 'Unbekannt',
      dms,
      answered:     ans,
      appointments: appts,
      answerRate:   dms > 0 ? Math.round((ans   / dms) * 100) : 0,
      apptRate:     dms > 0 ? Math.round((appts / dms) * 100) : 0,
    });
  }
  templateMetrics.sort((a, b) => b.answerRate - a.answerRate);

  return { totals, members: memberMetrics, templates: templateMetrics, daily };
}

const dateInputStyle: React.CSSProperties = {
  fontFamily:    'var(--font-sans)',
  fontSize:      '13px',
  color:         'var(--ink)',
  background:    'var(--frost)',
  border:        '1px solid var(--mist)',
  borderRadius:  'var(--radius-2)',
  padding:       '5px 10px',
  outline:       'none',
  cursor:        'pointer',
  transition:    'border-color 120ms var(--ease-default), box-shadow 120ms var(--ease-default)',
};

interface Props {
  data: AnalyticsData;
}

export function AnalyticsDashboardClient({ data }: Props) {
  const [timeRange,     setTimeRange]     = useState<TimeRange>('30d');
  const [customStart,   setCustomStart]   = useState<string>(daysAgoStr(30));
  const [customEnd,     setCustomEnd]     = useState<string>(todayStr());
  const [selectedMember, setSelectedMember] = useState<MemberMetrics | null>(null);

  const { since, until } = useMemo(
    () => getDateRange(timeRange, customStart, customEnd),
    [timeRange, customStart, customEnd],
  );

  const { totals, members, templates, daily } = useMemo(
    () => compute(data.pitchSummaries, data.dealSummaries, data.members, data.templates, since, until),
    [data, since, until],
  );

  return (
    <Box>
      {/* Page Header */}
      <Box mb={8}>
        <Text
          fontFamily="var(--font-sans)"
          fontSize="11px"
          fontWeight={500}
          letterSpacing="0.12em"
          textTransform="uppercase"
          color="var(--mute)"
          mb={2}
          display="flex"
          alignItems="center"
          gap="6px"
        >
          — Org Admin
        </Text>
        <h1
          style={{
            fontFamily:    'var(--font-display)',
            fontSize:      'clamp(32px, 4vw, 48px)',
            lineHeight:    1.1,
            letterSpacing: '-0.03em',
            fontWeight:    400,
            color:         'var(--ink)',
          }}
        >
          Analytics
        </h1>
      </Box>

      {/* Time Range Filter */}
      <Box mb={8}>
        <HStack spacing={1} justify="flex-end" mb={timeRange === 'custom' ? 3 : 0}>
          {TIME_OPTIONS.map(opt => (
            <Box
              as="button"
              key={opt.value}
              onClick={() => setTimeRange(opt.value)}
              px={3}
              py="5px"
              borderRadius="var(--radius-full)"
              fontFamily="var(--font-sans)"
              fontSize="13px"
              fontWeight={timeRange === opt.value ? 500 : 400}
              bg={timeRange === opt.value ? 'var(--forest)' : 'transparent'}
              color={timeRange === opt.value ? 'var(--paper)' : 'var(--mute)'}
              border="1px solid"
              borderColor={timeRange === opt.value ? 'var(--forest)' : 'var(--mist)'}
              cursor="pointer"
              transition="all 120ms var(--ease-default)"
              _hover={timeRange !== opt.value ? { color: 'var(--ink)', borderColor: 'var(--mute)' } : {}}
            >
              {opt.label}
            </Box>
          ))}
        </HStack>

        {timeRange === 'custom' && (
          <HStack spacing={2} justify="flex-end">
            <Text
              fontFamily="var(--font-mono)"
              fontSize="10px"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color="var(--mute)"
            >
              Von
            </Text>
            <input
              type="date"
              value={customStart}
              max={customEnd}
              onChange={e => setCustomStart(e.target.value)}
              style={dateInputStyle}
            />
            <Text
              fontFamily="var(--font-mono)"
              fontSize="10px"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color="var(--mute)"
            >
              Bis
            </Text>
            <input
              type="date"
              value={customEnd}
              min={customStart}
              max={todayStr()}
              onChange={e => setCustomEnd(e.target.value)}
              style={dateInputStyle}
            />
          </HStack>
        )}
      </Box>

      {/* KPI Cards */}
      <KPICards totals={totals} />

      {/* Animated Chase Trail Divider */}
      <Box my={8} position="relative" h="1px" w="100%" overflow="hidden">
        <MotionBox
          style={{
            position:       'absolute',
            inset:          0,
            background:     'linear-gradient(90deg, transparent 0%, #1F3A2E 50%, transparent 100%)',
            backgroundSize: '200% 100%',
          }}
          initial={{ backgroundPosition: '200% 0' }}
          animate={{ backgroundPosition: '-200% 0' }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </Box>

      {/* Charts Row */}
      <Grid
        templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
        gap={6}
        mb={6}
      >
        <GridItem>
          <Box
            bg="var(--frost)"
            border="1px solid var(--mist)"
            borderRadius="var(--radius-3)"
            p={6}
            h="100%"
          >
            <Text
              fontFamily="var(--font-mono)"
              fontSize="10px"
              letterSpacing="0.10em"
              textTransform="uppercase"
              color="var(--mute)"
              mb={5}
            >
              DMs pro Tag
            </Text>
            {daily.length > 0 ? (
              <DmsPerDayChart data={daily} />
            ) : (
              <Text fontSize="13px" color="var(--mute)" fontFamily="var(--font-sans)" mt={4}>
                Keine Daten im gewählten Zeitraum.
              </Text>
            )}
          </Box>
        </GridItem>

        <GridItem>
          <Box
            bg="var(--frost)"
            border="1px solid var(--mist)"
            borderRadius="var(--radius-3)"
            p={6}
            h="100%"
          >
            <Text
              fontFamily="var(--font-mono)"
              fontSize="10px"
              letterSpacing="0.10em"
              textTransform="uppercase"
              color="var(--mute)"
              mb={5}
            >
              Funnel — DMs → Deals
            </Text>
            <FunnelChart totals={totals} />
          </Box>
        </GridItem>
      </Grid>

      {/* Template Performance */}
      {templates.length > 0 && (
        <Box mb={6}>
          <Box
            bg="var(--frost)"
            border="1px solid var(--mist)"
            borderRadius="var(--radius-3)"
            p={6}
            mb={6}
          >
            <Text
              fontFamily="var(--font-mono)"
              fontSize="10px"
              letterSpacing="0.10em"
              textTransform="uppercase"
              color="var(--mute)"
              mb={5}
            >
              Antwortrate nach Template
            </Text>
            <AnswerRateByTemplateChart templates={templates} />
          </Box>

          <Box
            bg="var(--frost)"
            border="1px solid var(--mist)"
            borderRadius="var(--radius-3)"
            p={6}
          >
            <Text
              fontFamily="var(--font-mono)"
              fontSize="10px"
              letterSpacing="0.10em"
              textTransform="uppercase"
              color="var(--mute)"
              mb={5}
            >
              Template Performance
            </Text>
            <TemplatePerformanceTable templates={templates} />
          </Box>
        </Box>
      )}

      {/* Team Overview */}
      <Box
        bg="var(--frost)"
        border="1px solid var(--mist)"
        borderRadius="var(--radius-3)"
        p={6}
      >
        <Text
          fontFamily="var(--font-mono)"
          fontSize="10px"
          letterSpacing="0.10em"
          textTransform="uppercase"
          color="var(--mute)"
          mb={5}
        >
          Team-Übersicht
        </Text>
        <TeamTable members={members} onSelect={setSelectedMember} />
      </Box>

      {/* Member Detail Modal */}
      <MemberDetailModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </Box>
  );
}
