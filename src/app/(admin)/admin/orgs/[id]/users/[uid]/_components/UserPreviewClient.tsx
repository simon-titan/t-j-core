'use client';

import { useRouter } from 'next/navigation';
import { Box, Text, Select } from '@chakra-ui/react';
import { ChevronLeft, Eye, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { ModuleWithProgress } from '@/app/(app)/app/onboarding/_components/types';

// ── Minimal types for the read-only view ─────────────────────────────────────

interface ProspectMin { first_name: string; last_name: string; company: string | null }
interface TemplateMin { name: string }
interface PitchRow {
  id:          string;
  status:      string;
  sent_at:     string;
  answered_at: string | null;
  prospects:   ProspectMin | null;
  pitch_templates: TemplateMin | null;
}
interface LeadRow {
  id:        string;
  status:    string;
  deal_value: number | null;
  updated_at: string;
  prospects: ProspectMin | null;
}

interface Props {
  orgId:               string;
  orgName:             string;
  uid:                 string;
  userName:            string | null;
  userRole:            string;
  pitches:             PitchRow[];
  leads:               LeadRow[];
  modules:             (ModuleWithProgress & { hasUnreqAnswered?: boolean })[];
  orgMembers:          { id: string; full_name: string | null }[];
  noteCountsByModule?: Record<string, number>;
}

// ── Status colours ────────────────────────────────────────────────────────────

const PITCH_COLORS: Record<string, { bg: string; border: string; color: string }> = {
  sent:      { bg: 'var(--frost)',            border: 'var(--mist)',            color: 'var(--mute)'   },
  delivered: { bg: 'rgba(234,179,8,0.08)',    border: 'rgba(234,179,8,0.20)',   color: '#854D0E'       },
  answered:  { bg: 'rgba(74,124,92,0.10)',    border: 'rgba(74,124,92,0.25)',   color: 'var(--forest)' },
  ignored:   { bg: 'rgba(239,68,68,0.07)',    border: 'rgba(239,68,68,0.18)',   color: '#991B1B'       },
  bounced:   { bg: 'rgba(14,14,12,0.05)',     border: 'rgba(14,14,12,0.12)',    color: 'var(--mute)'   },
};

const LEAD_COLORS: Record<string, { bg: string; border: string; color: string }> = {
  new:         { bg: 'rgba(74,124,92,0.10)', border: 'rgba(74,124,92,0.25)', color: 'var(--forest)' },
  contacted:   { bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.20)', color: '#854D0E'        },
  qualified:   { bg: 'rgba(74,124,92,0.15)', border: 'rgba(74,124,92,0.30)', color: 'var(--forest)'  },
  proposal:    { bg: 'rgba(14,14,12,0.06)',  border: 'rgba(14,14,12,0.14)',  color: 'var(--ink)'     },
  negotiating: { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.25)', color: '#854D0E'        },
  won:         { bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.20)', color: '#166534'        },
  lost:        { bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.18)', color: '#991B1B'        },
};

const MODULE_STATUS_COLORS = {
  not_started: { bg: 'var(--frost)',            border: 'var(--mist)',            color: 'var(--mute)'   },
  in_progress: { bg: 'rgba(234,179,8,0.08)',    border: 'rgba(234,179,8,0.20)',   color: '#854D0E'       },
  completed:   { bg: 'rgba(74,124,92,0.10)',    border: 'rgba(74,124,92,0.25)',   color: 'var(--forest)' },
} as const;

const MODULE_STATUS_LABELS = {
  not_started: 'Nicht begonnen',
  in_progress: 'In Arbeit',
  completed:   'Abgeschlossen',
} as const;

function StatusBadge({ label, colors }: { label: string; colors: { bg: string; border: string; color: string } }) {
  return (
    <Box
      as="span"
      display="inline-flex"
      alignItems="center"
      px="8px"
      py="2px"
      borderRadius="var(--radius-full)"
      border="1px solid"
      fontSize="10px"
      fontFamily="var(--font-sans)"
      fontWeight={500}
      letterSpacing="0.04em"
      bg={colors.bg}
      borderColor={colors.border}
      color={colors.color}
      textTransform="capitalize"
    >
      {label}
    </Box>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function UserPreviewClient({
  orgId, orgName, uid, userName, userRole,
  pitches, leads, modules, orgMembers, noteCountsByModule = {},
}: Props) {
  const router = useRouter();

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });

  // Gesamt-Onboarding-Fortschritt
  const totalQ      = modules.reduce((s, m) => s + m.totalQuestions, 0);
  const totalAnsw   = modules.reduce((s, m) => s + m.answeredQuestions, 0);
  const totalPct    = totalQ > 0 ? Math.round((totalAnsw / totalQ) * 100) : 0;

  return (
    <Box maxW="var(--admin-max-width)" mx="auto">
      {/* Breadcrumb */}
      <Box
        as={Link}
        href={`/admin/orgs/${orgId}`}
        display="inline-flex"
        alignItems="center"
        gap={1}
        mb={6}
        fontFamily="var(--font-sans)"
        fontSize="13px"
        color="var(--mute)"
        textDecoration="none"
        transition="color 120ms"
        _hover={{ color: 'var(--ink)' }}
      >
        <ChevronLeft size={14} strokeWidth={1.5} />
        {orgName}
      </Box>

      {/* User header */}
      <Box mb={8} display="flex" alignItems="center" gap={4} flexWrap="wrap">
        <Box
          w="44px"
          h="44px"
          borderRadius="var(--radius-full)"
          bg="var(--ink)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <Text fontFamily="var(--font-mono)" fontSize="14px" fontWeight={700} color="var(--paper)">
            {(userName ?? 'U').charAt(0).toUpperCase()}
          </Text>
        </Box>

        <Box flex={1} minW={0}>
          <Box display="flex" alignItems="center" gap={3} mb={1} flexWrap="wrap">
            <Text
              fontFamily="var(--font-sans)"
              fontSize="20px"
              fontWeight={600}
              letterSpacing="-0.02em"
              color="var(--ink)"
            >
              {userName ?? 'Unbekannter User'}
            </Text>
            <Box
              as="span"
              display="inline-flex"
              alignItems="center"
              px="8px"
              py="2px"
              borderRadius="var(--radius-full)"
              border="1px solid var(--mist)"
              fontSize="10px"
              fontFamily="var(--font-sans)"
              fontWeight={500}
              color="var(--mute)"
              bg="var(--frost)"
            >
              {userRole === 'org_admin' ? 'Org Admin' : 'Mitglied'}
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Eye size={12} strokeWidth={1.5} color="var(--mute)" />
            <Text fontFamily="var(--font-mono)" fontSize="11px" color="var(--mute)">
              Read-only Ansicht
            </Text>
          </Box>
        </Box>

        {/* User switcher */}
        {orgMembers.length > 1 && (
          <Box flexShrink={0}>
            <Text
              fontFamily="var(--font-mono)"
              fontSize="10px"
              fontWeight={500}
              letterSpacing="0.06em"
              textTransform="uppercase"
              color="var(--mute)"
              mb={1}
            >
              User wechseln
            </Text>
            <Select
              value={uid}
              onChange={e => router.push(`/admin/orgs/${orgId}/users/${e.target.value}`)}
              size="sm"
              h="32px"
              w="200px"
              fontFamily="var(--font-sans)"
              fontSize="13px"
              borderColor="var(--mist)"
              borderRadius="var(--radius-2)"
              bg="var(--frost)"
              _focus={{ borderColor: 'var(--leaf)', boxShadow: '0 0 0 2px rgba(74,124,92,0.12)' }}
            >
              {orgMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.full_name ?? m.id.slice(0, 8)}
                </option>
              ))}
            </Select>
          </Box>
        )}
      </Box>

      {/* ── Pitch Tracker ─────────────────────────────────────────────────── */}
      <Box mb={8}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Text fontFamily="var(--font-mono)" fontSize="11px" fontWeight={500} letterSpacing="0.08em" textTransform="uppercase" color="var(--mute)">
            Pitch Tracker
          </Text>
          <Text fontFamily="var(--font-mono)" fontSize="11px" color="var(--mute)">
            {pitches.length} {pitches.length === 1 ? 'Pitch' : 'Pitches'}
          </Text>
        </Box>

        <Box border="1px solid var(--mist)" borderRadius="var(--radius-3)" overflow="hidden" bg="var(--paper)">
          <Box overflowX="auto">
          <Box display="grid" gridTemplateColumns="1fr 160px 100px 100px 100px" minW="560px" px={5} py={3} bg="var(--frost)" borderBottom="1px solid var(--mist)">
            {['Prospect', 'Template', 'Status', 'Gesendet', 'Antwort'].map(h => (
              <Text key={h} fontFamily="var(--font-mono)" fontSize="10px" fontWeight={500} letterSpacing="0.08em" textTransform="uppercase" color="var(--mute)">{h}</Text>
            ))}
          </Box>

          {pitches.length === 0 ? (
            <Box px={5} py={6} textAlign="center">
              <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--mute)">Noch keine Pitches.</Text>
            </Box>
          ) : (
            pitches.map((p, i) => {
              const pc = PITCH_COLORS[p.status] ?? PITCH_COLORS.sent;
              return (
                <Box key={p.id} display="grid" gridTemplateColumns="1fr 160px 100px 100px 100px" minW="560px" px={5} py={3} borderBottom={i < pitches.length - 1 ? '1px solid var(--mist)' : undefined} alignItems="center">
                  <Box>
                    <Text fontFamily="var(--font-sans)" fontSize="13px" fontWeight={500} color="var(--ink)">
                      {p.prospects ? `${p.prospects.first_name} ${p.prospects.last_name}` : '—'}
                    </Text>
                    {p.prospects?.company && <Text fontFamily="var(--font-sans)" fontSize="11px" color="var(--mute)">{p.prospects.company}</Text>}
                  </Box>
                  <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--mute)" isTruncated>{p.pitch_templates?.name ?? '—'}</Text>
                  <StatusBadge label={p.status} colors={pc} />
                  <Text fontFamily="var(--font-mono)" fontSize="12px" color="var(--mute)">{fmt(p.sent_at)}</Text>
                  <Text fontFamily="var(--font-mono)" fontSize="12px" color="var(--mute)">{p.answered_at ? fmt(p.answered_at) : '—'}</Text>
                </Box>
              );
            })
          )}
          </Box>
        </Box>
      </Box>

      {/* ── Leads / CRM ──────────────────────────────────────────────────── */}
      <Box mb={8}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Text fontFamily="var(--font-mono)" fontSize="11px" fontWeight={500} letterSpacing="0.08em" textTransform="uppercase" color="var(--mute)">CRM — Leads</Text>
          <Text fontFamily="var(--font-mono)" fontSize="11px" color="var(--mute)">{leads.length} {leads.length === 1 ? 'Lead' : 'Leads'}</Text>
        </Box>

        <Box border="1px solid var(--mist)" borderRadius="var(--radius-3)" overflow="hidden" bg="var(--paper)">
          <Box overflowX="auto">
          <Box display="grid" gridTemplateColumns="1fr 120px 120px 120px" minW="480px" px={5} py={3} bg="var(--frost)" borderBottom="1px solid var(--mist)">
            {['Prospect', 'Status', 'Deal-Wert', 'Aktualisiert'].map(h => (
              <Text key={h} fontFamily="var(--font-mono)" fontSize="10px" fontWeight={500} letterSpacing="0.08em" textTransform="uppercase" color="var(--mute)">{h}</Text>
            ))}
          </Box>

          {leads.length === 0 ? (
            <Box px={5} py={6} textAlign="center">
              <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--mute)">Noch keine Leads.</Text>
            </Box>
          ) : (
            leads.map((l, i) => {
              const lc = LEAD_COLORS[l.status] ?? LEAD_COLORS.new;
              return (
                <Box key={l.id} display="grid" gridTemplateColumns="1fr 120px 120px 120px" minW="480px" px={5} py={3} borderBottom={i < leads.length - 1 ? '1px solid var(--mist)' : undefined} alignItems="center">
                  <Text fontFamily="var(--font-sans)" fontSize="13px" fontWeight={500} color="var(--ink)">
                    {l.prospects ? `${l.prospects.first_name} ${l.prospects.last_name}` : '—'}
                  </Text>
                  <StatusBadge label={l.status} colors={lc} />
                  <Text fontFamily="var(--font-mono)" fontSize="12px" color="var(--ink)">
                    {l.deal_value != null ? `€ ${l.deal_value.toLocaleString('de-DE')}` : '—'}
                  </Text>
                  <Text fontFamily="var(--font-mono)" fontSize="12px" color="var(--mute)">{fmt(l.updated_at)}</Text>
                </Box>
              );
            })
          )}
          </Box>
        </Box>
      </Box>

      {/* ── Onboarding-Fortschritt ────────────────────────────────────────── */}
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Text fontFamily="var(--font-mono)" fontSize="11px" fontWeight={500} letterSpacing="0.08em" textTransform="uppercase" color="var(--mute)">
            Onboarding-Fortschritt
          </Text>
          <Text fontFamily="var(--font-mono)" fontSize="11px" color="var(--mute)">
            {totalAnsw} / {totalQ} Fragen
          </Text>
        </Box>

        {/* Gesamt-Fortschrittsbalken */}
        <Box mb={5} display="flex" alignItems="center" gap={4}>
          <Box flex={1} h="4px" bg="var(--mist)" borderRadius="var(--radius-full)" overflow="hidden">
            <Box
              h="100%"
              borderRadius="var(--radius-full)"
              style={{
                width: `${totalPct}%`,
                background: 'var(--gradient-leaf-glow)',
                transition: 'width 600ms ease',
              }}
            />
          </Box>
          <Text fontFamily="var(--font-mono)" fontSize="12px" color="var(--mute)" flexShrink={0}>
            {totalPct}%
          </Text>
        </Box>

        {/* Modul-Tabelle */}
        <Box border="1px solid var(--mist)" borderRadius="var(--radius-3)" overflow="hidden" bg="var(--paper)">
          {/* Head */}
          <Box
            display="grid"
            gridTemplateColumns="1fr 90px 100px 80px 100px 60px 32px"
            px={5}
            py={3}
            bg="var(--frost)"
            borderBottom="1px solid var(--mist)"
          >
            {['Modul', 'Typ', 'Fortschritt', '%', 'Status', 'Notizen', ''].map(h => (
              <Text key={h} fontFamily="var(--font-mono)" fontSize="10px" fontWeight={500} letterSpacing="0.08em" textTransform="uppercase" color="var(--mute)">{h}</Text>
            ))}
          </Box>

          {modules.length === 0 ? (
            <Box px={5} py={6} textAlign="center">
              <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--mute)">Keine aktiven Module.</Text>
            </Box>
          ) : (
            modules.map((mod, i) => {
              const sc = MODULE_STATUS_COLORS[mod.status];
              const barColor = mod.status === 'completed'
                ? 'var(--gradient-leaf-glow)'
                : mod.status === 'in_progress'
                ? 'linear-gradient(90deg, rgba(234,179,8,0.70) 0%, rgba(234,179,8,0.90) 100%)'
                : 'var(--mist)';

              return (
                <Box
                  key={mod.id}
                  display="grid"
                  gridTemplateColumns="1fr 90px 100px 80px 100px 60px 32px"
                  px={5}
                  py={3}
                  borderBottom={i < modules.length - 1 ? '1px solid var(--mist)' : undefined}
                  alignItems="center"
                  cursor="pointer"
                  transition="background 120ms var(--ease-default)"
                  _hover={{ bg: 'rgba(14,14,12,0.02)' }}
                  onClick={() => router.push(`/admin/orgs/${orgId}/users/${uid}/onboarding/${mod.slug}`)}
                >
                  {/* Modul-Name */}
                  <Text fontFamily="var(--font-sans)" fontSize="13px" fontWeight={500} color="var(--ink)" isTruncated>
                    {mod.title}
                  </Text>

                  {/* Typ-Badge */}
                  <Box>
                    <Box
                      as="span"
                      display="inline-flex"
                      px="6px"
                      py="2px"
                      borderRadius="var(--radius-full)"
                      border="1px solid"
                      fontSize="10px"
                      fontFamily="var(--font-sans)"
                      fontWeight={500}
                      bg={mod.type === 'workbook' ? 'rgba(74,124,92,0.10)' : 'var(--frost)'}
                      borderColor={mod.type === 'workbook' ? 'rgba(74,124,92,0.25)' : 'var(--mist)'}
                      color={mod.type === 'workbook' ? 'var(--forest)' : 'var(--mute)'}
                    >
                      {mod.type === 'workbook' ? 'Workbook' : 'Ref.'}
                    </Box>
                  </Box>

                  {/* Fortschrittsbalken */}
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box w="72px" h="3px" bg="var(--mist)" borderRadius="var(--radius-full)" overflow="hidden" flexShrink={0}>
                      <Box
                        h="100%"
                        borderRadius="var(--radius-full)"
                        style={{ width: `${mod.percentage}%`, background: barColor }}
                      />
                    </Box>
                  </Box>

                  {/* % */}
                  <Text fontFamily="var(--font-mono)" fontSize="12px" color="var(--ink)">
                    {mod.answeredQuestions}/{mod.totalQuestions}
                  </Text>

                  {/* Status-Badge */}
                  <StatusBadge label={MODULE_STATUS_LABELS[mod.status]} colors={sc} />

                  {/* Notizen-Badge */}
                  <Box>
                    {(noteCountsByModule[mod.id] ?? 0) > 0 ? (
                      <Box
                        as="span"
                        display="inline-flex"
                        alignItems="center"
                        px="8px"
                        py="2px"
                        borderRadius="var(--radius-full)"
                        border="1px solid rgba(74,124,92,0.25)"
                        fontSize="10px"
                        fontFamily="var(--font-mono)"
                        fontWeight={600}
                        bg="rgba(74,124,92,0.10)"
                        color="var(--forest)"
                      >
                        {noteCountsByModule[mod.id]}
                      </Box>
                    ) : (
                      <Text fontFamily="var(--font-mono)" fontSize="12px" color="var(--mist)">—</Text>
                    )}
                  </Box>

                  {/* Warn-Indikator */}
                  <Box display="flex" alignItems="center" justifyContent="center">
                    {(mod as any).hasUnreqAnswered && (
                      <AlertCircle size={14} strokeWidth={1.5} color="#991B1B" />
                    )}
                  </Box>
                </Box>
              );
            })
          )}
        </Box>

        {/* Legende */}
        <Box display="flex" alignItems="center" gap={4} mt={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <AlertCircle size={11} strokeWidth={1.5} color="#991B1B" />
            <Text fontFamily="var(--font-mono)" fontSize="10px" color="var(--mute)">= Pflichtfragen ohne Antwort</Text>
          </Box>
          <Text fontFamily="var(--font-mono)" fontSize="10px" color="var(--mute)">
            Klick auf Zeile → Modul-Detailansicht
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
