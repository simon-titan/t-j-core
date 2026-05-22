'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Text, SimpleGrid } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Send, TrendingUp, CalendarDays, Trophy, Euro } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const MotionBox = motion(Box);

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeRange = '7d' | '30d' | '90d' | 'all';

interface MemberMin {
  id:        string;
  full_name: string | null;
}

interface TemplateRow {
  templateId: string;
  name:       string;
  dms:        number;
  answered:   number;
  rate:       number;
}

interface MemberRow {
  userId:       string;
  name:         string;
  dms:          number;
  answerRate:   number;
  appointments: number;
  closed:       number;
}

interface FunnelRow {
  stage:     string;
  label:     string;
  color:     string;
  count:     number;
  dealValue: number;
}

interface AnalyticsData {
  totalDMs:     number;
  answered:     number;
  answerRate:   number;
  appointments: number;
  closedDeals:  number;
  revenue:      number;
  byTemplate:   TemplateRow[];
  byMember:     MemberRow[];
  crmFunnel:    FunnelRow[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: '7 Tage',  value: '7d'  },
  { label: '30 Tage', value: '30d' },
  { label: '90 Tage', value: '90d' },
  { label: 'Gesamt',  value: 'all' },
];

const KPI_CONFIG = [
  { key: 'totalDMs',     label: 'Gesamt DMs',   unit: '',  Icon: Send,         iconBg: 'rgba(45,84,67,0.10)' },
  { key: 'answerRate',   label: 'Antwortrate',  unit: '%', Icon: TrendingUp,   iconBg: 'rgba(74,124,92,0.10)' },
  { key: 'appointments', label: 'Termine',      unit: '',  Icon: CalendarDays, iconBg: 'rgba(45,84,67,0.08)' },
  { key: 'closedDeals',  label: 'Closed Deals', unit: '',  Icon: Trophy,       iconBg: 'rgba(74,124,92,0.08)' },
  { key: 'revenue',      label: 'Umsatz',       unit: '€', Icon: Euro,         iconBg: 'rgba(45,84,67,0.12)' },
] as const;

const FUNNEL_STAGES = [
  { stage: 'new',         label: 'Neu',          color: 'rgba(74,124,92,0.70)'  },
  { stage: 'contacted',   label: 'Kontaktiert',  color: 'rgba(74,124,92,0.55)'  },
  { stage: 'qualified',   label: 'Qualifiziert', color: 'rgba(74,124,92,0.70)'  },
  { stage: 'proposal',    label: 'Angebot',      color: 'rgba(45,84,67,0.75)'   },
  { stage: 'negotiating', label: 'Verhandlung',  color: 'rgba(234,179,8,0.65)'  },
  { stage: 'won',         label: 'Gewonnen',     color: 'rgba(34,197,94,0.70)'  },
  { stage: 'lost',        label: 'Verloren',     color: 'rgba(239,68,68,0.60)'  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCutoff(range: TimeRange): string | null {
  if (range === 'all') return null;
  const d    = new Date();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TableHeader({ cols }: { cols: string[] }) {
  return (
    <Box
      display="grid"
      gridTemplateColumns={`1fr ${cols.slice(1).map(() => '80px').join(' ')}`}
      px={5}
      py={3}
      bg="var(--frost)"
      borderBottom="1px solid var(--mist)"
    >
      {cols.map(h => (
        <Text
          key={h}
          fontFamily="var(--font-mono)"
          fontSize="10px"
          fontWeight={500}
          letterSpacing="0.08em"
          textTransform="uppercase"
          color="var(--mute)"
        >
          {h}
        </Text>
      ))}
    </Box>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <Box px={5} py={6} textAlign="center">
      <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--mute)">
        {message}
      </Text>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  orgId:   string;
  members: MemberMin[];
}

export function OrgAnalyticsTab({ orgId, members }: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [data, setData]           = useState<AnalyticsData | null>(null);
  const [loading, setLoading]     = useState(true);

  const memberIds = useMemo(() => members.map(m => m.id), [members]);

  const fetchData = useCallback(async () => {
    if (memberIds.length === 0) {
      setData({ totalDMs: 0, answered: 0, answerRate: 0, appointments: 0, closedDeals: 0, revenue: 0, byTemplate: [], byMember: [], crmFunnel: FUNNEL_STAGES.map(s => ({ ...s, count: 0, dealValue: 0 })) });
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const cutoff   = getCutoff(timeRange);

    // Build queries
    let pitchQ = supabase
      .from('pitches')
      .select('id, sent_by, status, template_id, pitch_templates(name)')
      .in('sent_by', memberIds);
    if (cutoff) pitchQ = pitchQ.gte('sent_at', cutoff);

    let apptQ = supabase
      .from('appointments')
      .select('id, assigned_to, status')
      .in('assigned_to', memberIds)
      .in('status', ['scheduled', 'completed']);
    if (cutoff) apptQ = apptQ.gte('scheduled_at', cutoff);

    let wonQ = supabase
      .from('leads')
      .select('id, assigned_to, deal_value, updated_at')
      .eq('organization_id', orgId)
      .eq('status', 'won');
    if (cutoff) wonQ = wonQ.gte('updated_at', cutoff);

    const allLeadsQ = supabase
      .from('leads')
      .select('id, status, assigned_to, deal_value')
      .eq('organization_id', orgId);

    const [pitchRes, apptRes, wonRes, allLeadsRes] = await Promise.all([
      pitchQ, apptQ, wonQ, allLeadsQ,
    ]);

    const pitches  = (pitchRes.data    ?? []) as any[];
    const appts    = (apptRes.data     ?? []) as any[];
    const wonLeads = (wonRes.data      ?? []) as any[];
    const allLeads = (allLeadsRes.data ?? []) as any[];

    // ── KPI aggregation ───────────────────────────────────────
    const answeredCount = pitches.filter((p: any) => p.status === 'answered').length;
    const answerRate    = pitches.length > 0 ? Math.round((answeredCount / pitches.length) * 100) : 0;
    const revenue       = wonLeads.reduce((s: number, l: any) => s + (l.deal_value ?? 0), 0);

    // ── By template ───────────────────────────────────────────
    const templateMap = new Map<string, TemplateRow>();
    for (const p of pitches) {
      const key  = p.template_id ?? '__none__';
      const name = (p.pitch_templates as any)?.name ?? 'Kein Template';
      if (!templateMap.has(key)) templateMap.set(key, { templateId: key, name, dms: 0, answered: 0, rate: 0 });
      const row = templateMap.get(key)!;
      row.dms++;
      if (p.status === 'answered') row.answered++;
    }
    const byTemplate = Array.from(templateMap.values())
      .map(t => ({ ...t, rate: t.dms > 0 ? Math.round((t.answered / t.dms) * 100) : 0 }))
      .sort((a, b) => b.dms - a.dms);

    // ── By member ─────────────────────────────────────────────
    const answeredPerMember: Record<string, number> = {};
    for (const p of pitches) {
      if (p.status === 'answered') answeredPerMember[p.sent_by] = (answeredPerMember[p.sent_by] ?? 0) + 1;
    }
    const dmsPerMember: Record<string, number> = {};
    for (const p of pitches) dmsPerMember[p.sent_by] = (dmsPerMember[p.sent_by] ?? 0) + 1;

    const apptsPerMember: Record<string, number> = {};
    for (const a of appts) apptsPerMember[a.assigned_to] = (apptsPerMember[a.assigned_to] ?? 0) + 1;

    const closedPerMember: Record<string, number> = {};
    for (const l of wonLeads) closedPerMember[l.assigned_to] = (closedPerMember[l.assigned_to] ?? 0) + 1;

    const byMember: MemberRow[] = members
      .map(m => {
        const dms = dmsPerMember[m.id] ?? 0;
        const ans = answeredPerMember[m.id] ?? 0;
        return {
          userId:       m.id,
          name:         m.full_name ?? 'Unbekannt',
          dms,
          answerRate:   dms > 0 ? Math.round((ans / dms) * 100) : 0,
          appointments: apptsPerMember[m.id] ?? 0,
          closed:       closedPerMember[m.id] ?? 0,
        };
      })
      .sort((a, b) => b.dms - a.dms);

    // ── CRM Funnel ────────────────────────────────────────────
    const stageCount: Record<string, { count: number; dealValue: number }> = {};
    for (const s of FUNNEL_STAGES) stageCount[s.stage] = { count: 0, dealValue: 0 };
    for (const l of allLeads) {
      if (stageCount[l.status]) {
        stageCount[l.status].count++;
        stageCount[l.status].dealValue += l.deal_value ?? 0;
      }
    }
    const crmFunnel = FUNNEL_STAGES.map(s => ({
      ...s,
      count:     stageCount[s.stage]?.count     ?? 0,
      dealValue: stageCount[s.stage]?.dealValue ?? 0,
    }));

    setData({ totalDMs: pitches.length, answered: answeredCount, answerRate, appointments: appts.length, closedDeals: wonLeads.length, revenue, byTemplate, byMember, crmFunnel });
    setLoading(false);
  }, [orgId, memberIds, timeRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const kpiValues: Record<string, number> = data
    ? { totalDMs: data.totalDMs, answerRate: data.answerRate, appointments: data.appointments, closedDeals: data.closedDeals, revenue: data.revenue }
    : { totalDMs: 0, answerRate: 0, appointments: 0, closedDeals: 0, revenue: 0 };

  const maxFunnelCount = Math.max(1, ...(data?.crmFunnel.map(f => f.count) ?? [1]));

  return (
    <Box>
      {/* ── Header / Time Range ── */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Text fontFamily="var(--font-mono)" fontSize="10px" letterSpacing="0.14em" textTransform="uppercase" color="var(--mute)" mb={1}>
            — Auswertung
          </Text>
          <Text fontFamily="var(--font-display)" fontStyle="italic" fontSize="22px" letterSpacing="-0.02em" color="var(--ink)">
            Statistiken
          </Text>
        </Box>

        {/* Time Range Selector */}
        <Box
          display="flex"
          bg="var(--frost)"
          border="1px solid var(--mist)"
          borderRadius="var(--radius-2)"
          p="3px"
          gap={0}
        >
          {TIME_OPTIONS.map(opt => (
            <Box
              as="button"
              key={opt.value}
              onClick={() => setTimeRange(opt.value)}
              px="14px"
              py="6px"
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
        </Box>
      </Box>

      {/* ── KPI Cards ── */}
      <SimpleGrid columns={{ base: 2, lg: 5 }} spacing={4} mb={8}>
        {KPI_CONFIG.map((kpi, i) => (
          <MotionBox
            key={kpi.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1], delay: i * 0.06 } as never}
            bg="rgba(248,248,250,0.85)"
            backdropFilter="blur(12px) saturate(1.4)"
            border="1px solid rgba(14,14,12,0.08)"
            borderRadius="var(--radius-5)"
            p={5}
            boxShadow="var(--shadow-cool-2)"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              right={0}
              w="56px"
              h="56px"
              bg={kpi.iconBg}
              borderRadius="0 var(--radius-5) 0 56px"
              opacity={0.7}
            />
            <Box display="flex" flexDirection="column" gap="10px" position="relative">
              <Box
                w="28px"
                h="28px"
                bg={kpi.iconBg}
                border="1px solid rgba(45,84,67,0.12)"
                borderRadius="var(--radius-2)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <kpi.Icon size={13} strokeWidth={2} color="var(--forest)" />
              </Box>
              <Box>
                <Text fontFamily="var(--font-display)" fontSize="32px" fontStyle="italic" lineHeight={1} letterSpacing="-0.025em" color="var(--ink)">
                  {loading ? '—' : (
                    kpi.key === 'revenue'
                      ? kpiValues[kpi.key].toLocaleString('de-DE')
                      : kpiValues[kpi.key]
                  )}
                  {!loading && kpi.unit && (
                    <Text as="span" fontSize="16px" color="var(--mute)" ml="2px">{kpi.unit}</Text>
                  )}
                </Text>
                <Text fontFamily="var(--font-mono)" fontSize="9px" letterSpacing="0.12em" textTransform="uppercase" color="var(--mute)" mt={1}>
                  {kpi.label}
                </Text>
              </Box>
            </Box>
          </MotionBox>
        ))}
      </SimpleGrid>

      {loading ? (
        <Box py={12} textAlign="center">
          <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--mute)">Lade Daten…</Text>
        </Box>
      ) : (
        <>
          {/* ── Pitch Varianten Tabelle ── */}
          <Box mb={8}>
            <Text fontFamily="var(--font-mono)" fontSize="11px" fontWeight={500} letterSpacing="0.08em" textTransform="uppercase" color="var(--mute)" mb={3}>
              Pitch Varianten
            </Text>
            <Box border="1px solid var(--mist)" borderRadius="var(--radius-3)" overflow="hidden" bg="var(--paper)">
              <Box display="grid" gridTemplateColumns="1fr 80px 80px 80px" px={5} py={3} bg="var(--frost)" borderBottom="1px solid var(--mist)">
                {['Variante', 'DMs', 'Antworten', 'Rate'].map(h => (
                  <Text key={h} fontFamily="var(--font-mono)" fontSize="10px" fontWeight={500} letterSpacing="0.08em" textTransform="uppercase" color="var(--mute)">{h}</Text>
                ))}
              </Box>

              {data!.byTemplate.length === 0 ? (
                <EmptyRow message="Keine Pitches im gewählten Zeitraum." />
              ) : (
                data!.byTemplate.map((t, i) => (
                  <Box
                    key={t.templateId}
                    display="grid"
                    gridTemplateColumns="1fr 80px 80px 80px"
                    px={5}
                    py={3}
                    borderBottom={i < data!.byTemplate.length - 1 ? '1px solid var(--mist)' : undefined}
                    alignItems="center"
                  >
                    <Text fontFamily="var(--font-sans)" fontSize="13px" fontWeight={500} color="var(--ink)" isTruncated>{t.name}</Text>
                    <Text fontFamily="var(--font-mono)" fontSize="13px" color="var(--ink)">{t.dms.toLocaleString('de-DE')}</Text>
                    <Text fontFamily="var(--font-mono)" fontSize="13px" color="var(--ink)">{t.answered}</Text>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box flex={1} h="3px" bg="var(--mist)" borderRadius="var(--radius-full)" overflow="hidden" maxW="40px">
                        <Box h="100%" borderRadius="var(--radius-full)" style={{ width: `${t.rate}%`, background: 'var(--gradient-leaf-glow)' }} />
                      </Box>
                      <Text fontFamily="var(--font-mono)" fontSize="12px" color="var(--ink)">{t.rate}%</Text>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Box>

          {/* ── Team Performance ── */}
          <Box mb={8}>
            <Text fontFamily="var(--font-mono)" fontSize="11px" fontWeight={500} letterSpacing="0.08em" textTransform="uppercase" color="var(--mute)" mb={3}>
              Team Performance
            </Text>
            <Box border="1px solid var(--mist)" borderRadius="var(--radius-3)" overflow="hidden" bg="var(--paper)">
              <Box display="grid" gridTemplateColumns="1fr 80px 80px 80px 80px" px={5} py={3} bg="var(--frost)" borderBottom="1px solid var(--mist)">
                {['Name', 'DMs', 'Rate', 'Termine', 'Closed'].map(h => (
                  <Text key={h} fontFamily="var(--font-mono)" fontSize="10px" fontWeight={500} letterSpacing="0.08em" textTransform="uppercase" color="var(--mute)">{h}</Text>
                ))}
              </Box>

              {data!.byMember.length === 0 ? (
                <EmptyRow message="Keine Mitglieder." />
              ) : (
                data!.byMember.map((m, i) => (
                  <Box
                    key={m.userId}
                    display="grid"
                    gridTemplateColumns="1fr 80px 80px 80px 80px"
                    px={5}
                    py={3}
                    borderBottom={i < data!.byMember.length - 1 ? '1px solid var(--mist)' : undefined}
                    alignItems="center"
                  >
                    <Text fontFamily="var(--font-sans)" fontSize="13px" fontWeight={500} color="var(--ink)" isTruncated>{m.name}</Text>
                    <Text fontFamily="var(--font-mono)" fontSize="13px" color="var(--ink)">{m.dms}</Text>
                    <Text fontFamily="var(--font-mono)" fontSize="13px" color="var(--ink)">{m.answerRate}%</Text>
                    <Text fontFamily="var(--font-mono)" fontSize="13px" color="var(--ink)">{m.appointments}</Text>
                    <Text fontFamily="var(--font-mono)" fontSize="13px" color="var(--ink)">{m.closed}</Text>
                  </Box>
                ))
              )}
            </Box>
          </Box>

          {/* ── CRM Funnel ── */}
          <Box mb={4}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Text fontFamily="var(--font-mono)" fontSize="11px" fontWeight={500} letterSpacing="0.08em" textTransform="uppercase" color="var(--mute)">
                CRM Pipeline
              </Text>
              <Text fontFamily="var(--font-mono)" fontSize="10px" color="var(--mute)">
                Gesamtpipeline · unabhängig vom Zeitraum
              </Text>
            </Box>

            <Box
              border="1px solid var(--mist)"
              borderRadius="var(--radius-3)"
              overflow="hidden"
              bg="var(--paper)"
              p={5}
              display="flex"
              flexDirection="column"
              gap={3}
            >
              {data!.crmFunnel.map(row => (
                <Box key={row.stage} display="grid" gridTemplateColumns="100px 1fr 60px 120px" alignItems="center" gap={4}>
                  <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--mute)" flexShrink={0}>
                    {row.label}
                  </Text>
                  <Box h="8px" bg="var(--frost)" borderRadius="var(--radius-full)" overflow="hidden">
                    <Box
                      h="100%"
                      borderRadius="var(--radius-full)"
                      style={{
                        width:      `${Math.round((row.count / maxFunnelCount) * 100)}%`,
                        background: row.color,
                        transition: 'width 600ms cubic-bezier(0.65,0,0.35,1)',
                      }}
                    />
                  </Box>
                  <Text fontFamily="var(--font-mono)" fontSize="12px" color="var(--ink)" textAlign="right">
                    {row.count}
                  </Text>
                  <Text fontFamily="var(--font-mono)" fontSize="11px" color="var(--mute)" textAlign="right">
                    {row.dealValue > 0 ? `€ ${row.dealValue.toLocaleString('de-DE')}` : '—'}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
