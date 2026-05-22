'use client';

import { useMemo, useState } from 'react';
import { Box, Text, HStack, Input, Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { t } from '@/lib/toast';
import type { DailyStatRow, LightMode, LightRawData, TimeRange, LightNumericKey } from './types';
import {
  LIGHT_NUMERIC_COLUMNS,
  aggregateAutoStats,
  filterManualByRange,
  calcRates,
  formatDateKey,
  toDateKey,
} from './types';

const MotionBox = motion(Box);

const TIME_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: '7 Tage',  value: '7d'  },
  { label: '30 Tage', value: '30d' },
  { label: '90 Tage', value: '90d' },
  { label: 'Gesamt',  value: 'all' },
];

const RATE_COLUMNS = [
  { key: 'answerRate',  label: 'Antwortquote' },
  { key: 'apptRate',    label: 'Terminquote'  },
  { key: 'closingRate', label: 'Closing Rate' },
] as const;

interface Props {
  mode:         LightMode;
  lightRawData: LightRawData;
  manualStats:  DailyStatRow[];
  userId:       string;
  orgId:        string;
}

const numInputStyle = {
  h: '34px',
  w: '100%',
  textAlign: 'right' as const,
  bg: 'transparent',
  border: '1px solid transparent',
  borderRadius: 'var(--radius-2)',
  fontFamily: 'var(--font-mono)',
  fontSize: '13px',
  color: 'var(--ink)',
  px: 2,
  _hover: { borderColor: 'var(--mist)' },
  _focus: { borderColor: 'var(--leaf)', bg: 'var(--paper)', boxShadow: '0 0 0 3px rgba(74,124,92,0.12)' },
};

export function PitchTrackerLightView({ mode, lightRawData, manualStats, userId, orgId }: Props) {
  const supabase = createClient();
  const [range, setRange] = useState<TimeRange>('30d');
  const [rows, setRows] = useState<DailyStatRow[]>(manualStats);
  const [newDate, setNewDate] = useState(() => toDateKey(new Date().toISOString()));
  const [saving, setSaving] = useState(false);

  const displayRows = useMemo(() => {
    if (mode === 'auto') return aggregateAutoStats(lightRawData, range);
    return filterManualByRange(rows, range);
  }, [mode, lightRawData, rows, range]);

  const totals = useMemo(() => {
    return displayRows.reduce(
      (acc, r) => ({
        messages_sent:    acc.messages_sent + r.messages_sent,
        followups_sent:   acc.followups_sent + r.followups_sent,
        replies_received: acc.replies_received + r.replies_received,
        appointments_set: acc.appointments_set + r.appointments_set,
        closings:         acc.closings + r.closings,
      }),
      { messages_sent: 0, followups_sent: 0, replies_received: 0, appointments_set: 0, closings: 0 }
    );
  }, [displayRows]);

  // ── Manual persistence ──────────────────────────────────────────────────────

  async function persistRow(row: DailyStatRow) {
    const { data, error } = await (supabase.from('pitch_tracker_daily_stats') as any)
      .upsert(
        {
          organization_id:  orgId,
          user_id:          userId,
          entry_date:       row.entry_date,
          messages_sent:    row.messages_sent,
          followups_sent:   row.followups_sent,
          replies_received: row.replies_received,
          appointments_set: row.appointments_set,
          closings:         row.closings,
        },
        { onConflict: 'user_id,entry_date' }
      )
      .select('id')
      .single();
    if (error) {
      t.error('Eintrag konnte nicht gespeichert werden');
      return null;
    }
    return data?.id as string | undefined;
  }

  function handleCellChange(entryDate: string, key: LightNumericKey, value: string) {
    const n = Math.max(0, Math.floor(Number(value) || 0));
    setRows(prev => prev.map(r => (r.entry_date === entryDate ? { ...r, [key]: n } : r)));
  }

  async function handleCellBlur(entryDate: string) {
    const row = rows.find(r => r.entry_date === entryDate);
    if (!row) return;
    const id = await persistRow(row);
    if (id && !row.id) {
      setRows(prev => prev.map(r => (r.entry_date === entryDate ? { ...r, id } : r)));
    }
  }

  async function handleAddDay() {
    if (!newDate) return;
    if (rows.some(r => r.entry_date === newDate)) {
      t.info('Für diesen Tag gibt es bereits einen Eintrag');
      return;
    }
    setSaving(true);
    const fresh: DailyStatRow = {
      entry_date: newDate,
      messages_sent: 0, followups_sent: 0, replies_received: 0, appointments_set: 0, closings: 0,
    };
    const id = await persistRow(fresh);
    setSaving(false);
    if (id) {
      setRows(prev => [{ ...fresh, id }, ...prev]);
      t.success('Tag hinzugefügt');
    }
  }

  async function handleDeleteRow(row: DailyStatRow) {
    setRows(prev => prev.filter(r => r.entry_date !== row.entry_date));
    if (row.id) {
      const { error } = await supabase.from('pitch_tracker_daily_stats').delete().eq('id', row.id);
      if (error) t.error('Eintrag konnte nicht gelöscht werden');
    }
  }

  // ── Layout ────────────────────────────────────────────────────────────────

  const gridTemplate = mode === 'manual'
    ? '110px repeat(5, 1fr) repeat(3, 96px) 44px'
    : '110px repeat(5, 1fr) repeat(3, 96px)';

  return (
    <MotionBox
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
    >
      {/* ── Toolbar ── */}
      <HStack justify="space-between" align="center" mb={5} flexWrap="wrap" gap={3}>
        <HStack spacing={3}>
          <Text
            fontFamily="var(--font-mono)"
            fontSize="10px"
            letterSpacing="0.14em"
            textTransform="uppercase"
            color="var(--mute)"
          >
            {mode === 'auto' ? 'Light · Automatisch' : 'Light · Manuell'}
          </Text>
          {mode === 'manual' && (
            <HStack spacing={2}>
              <Input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                h="34px"
                w="160px"
                bg="var(--frost)"
                border="1px solid var(--mist)"
                borderRadius="var(--radius-2)"
                fontFamily="var(--font-sans)"
                fontSize="13px"
                color="var(--ink)"
                _focus={{ borderColor: 'var(--leaf)', boxShadow: '0 0 0 3px rgba(74,124,92,0.12)' }}
              />
              <Button
                onClick={handleAddDay}
                isLoading={saving}
                loadingText="…"
                h="34px"
                px={4}
                leftIcon={<Plus size={14} strokeWidth={2.5} />}
                bg="var(--forest)"
                color="var(--paper)"
                fontFamily="var(--font-sans)"
                fontSize="13px"
                fontWeight={600}
                _hover={{ bg: 'var(--forest-deep)' }}
              >
                Tag
              </Button>
            </HStack>
          )}
        </HStack>

        {/* Time Range */}
        <HStack spacing={0} bg="var(--frost)" border="1px solid var(--mist)" borderRadius="var(--radius-2)" p="3px">
          {TIME_OPTIONS.map(opt => (
            <Box
              as="button"
              key={opt.value}
              onClick={() => setRange(opt.value)}
              px="14px"
              py="6px"
              borderRadius="5px"
              fontFamily="var(--font-display)"
              fontStyle={range === opt.value ? 'italic' : 'normal'}
              fontSize="13px"
              fontWeight={range === opt.value ? 600 : 400}
              bg={range === opt.value ? 'var(--forest)' : 'transparent'}
              color={range === opt.value ? 'var(--paper)' : 'var(--mute)'}
              cursor="pointer"
              sx={{ transition: 'all 140ms var(--ease-default)' }}
              _hover={range !== opt.value ? { color: 'var(--forest)', bg: 'rgba(45,84,67,0.06)' } : {}}
            >
              {opt.label}
            </Box>
          ))}
        </HStack>
      </HStack>

      {/* ── Table ── */}
      <Box border="1px solid var(--mist)" borderRadius="var(--radius-4)" overflowX="auto">
        <Box minW="900px">
          {/* Header */}
          <Box
            display="grid"
            gridTemplateColumns={gridTemplate}
            alignItems="center"
            px={3}
            h="44px"
            bg="var(--frost)"
            borderBottom="1px solid var(--mist)"
          >
            <HeaderCell label="Datum" />
            {LIGHT_NUMERIC_COLUMNS.map(c => <HeaderCell key={c.key} label={c.label} align="right" />)}
            {RATE_COLUMNS.map(c => <HeaderCell key={c.key} label={c.label} align="right" accent />)}
            {mode === 'manual' && <Box />}
          </Box>

          {/* Rows */}
          {displayRows.length === 0 ? (
            <Box py={14} textAlign="center">
              <Text fontFamily="var(--font-display)" fontStyle="italic" fontSize="22px" color="var(--mute)">
                Noch keine Daten.
              </Text>
              <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--mute)" mt={2}>
                {mode === 'auto'
                  ? 'Sobald du Pitches sendest, erscheinen hier deine Tageszahlen.'
                  : 'Füge oben einen Tag hinzu und trage deine Zahlen ein.'}
              </Text>
            </Box>
          ) : (
            displayRows.map(row => {
              const rates = calcRates(row);
              return (
                <Box
                  key={row.entry_date}
                  display="grid"
                  gridTemplateColumns={gridTemplate}
                  alignItems="center"
                  px={3}
                  minH="46px"
                  borderBottom="1px solid var(--mist)"
                  sx={{ '&:last-of-type': { borderBottom: 'none' } }}
                  _hover={{ bg: 'rgba(248,248,250,0.6)' }}
                >
                  <Text fontFamily="var(--font-mono)" fontSize="12px" color="var(--ink)">
                    {formatDateKey(row.entry_date)}
                  </Text>

                  {LIGHT_NUMERIC_COLUMNS.map(c =>
                    mode === 'manual' ? (
                      <Input
                        key={c.key}
                        type="number"
                        min={0}
                        value={row[c.key]}
                        onChange={e => handleCellChange(row.entry_date, c.key, e.target.value)}
                        onBlur={() => handleCellBlur(row.entry_date)}
                        {...numInputStyle}
                      />
                    ) : (
                      <Text key={c.key} textAlign="right" fontFamily="var(--font-mono)" fontSize="13px" color="var(--ink)" pr={2}>
                        {row[c.key]}
                      </Text>
                    )
                  )}

                  <RateCell value={rates.answerRate} />
                  <RateCell value={rates.apptRate} />
                  <RateCell value={rates.closingRate} />

                  {mode === 'manual' && (
                    <Box
                      as="button"
                      onClick={() => handleDeleteRow(row)}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="var(--mute)"
                      _hover={{ color: '#991B1B' }}
                      cursor="pointer"
                      aria-label="Tag löschen"
                    >
                      <Trash2 size={15} strokeWidth={1.75} />
                    </Box>
                  )}
                </Box>
              );
            })
          )}

          {/* Totals */}
          {displayRows.length > 0 && (() => {
            const totalRates = calcRates(totals);
            return (
              <Box
                display="grid"
                gridTemplateColumns={gridTemplate}
                alignItems="center"
                px={3}
                h="46px"
                bg="var(--frost)"
                borderTop="1px solid var(--mist)"
              >
                <Text fontFamily="var(--font-mono)" fontSize="10px" letterSpacing="0.10em" textTransform="uppercase" color="var(--mute)">
                  Summe
                </Text>
                {LIGHT_NUMERIC_COLUMNS.map(c => (
                  <Text key={c.key} textAlign="right" fontFamily="var(--font-mono)" fontSize="13px" fontWeight={700} color="var(--ink)" pr={2}>
                    {totals[c.key]}
                  </Text>
                ))}
                <RateCell value={totalRates.answerRate} bold />
                <RateCell value={totalRates.apptRate} bold />
                <RateCell value={totalRates.closingRate} bold />
                {mode === 'manual' && <Box />}
              </Box>
            );
          })()}
        </Box>
      </Box>
    </MotionBox>
  );
}

function HeaderCell({ label, align = 'left', accent = false }: { label: string; align?: 'left' | 'right'; accent?: boolean }) {
  return (
    <Text
      fontFamily="var(--font-mono)"
      fontSize="9px"
      letterSpacing="0.10em"
      textTransform="uppercase"
      color={accent ? 'var(--forest)' : 'var(--mute)'}
      textAlign={align}
      pr={align === 'right' ? 2 : 0}
      lineHeight={1.2}
    >
      {label}
    </Text>
  );
}

function RateCell({ value, bold = false }: { value: number; bold?: boolean }) {
  return (
    <Text
      textAlign="right"
      fontFamily="var(--font-mono)"
      fontSize="13px"
      fontWeight={bold ? 700 : 500}
      color="var(--forest)"
      pr={2}
    >
      {value.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
    </Text>
  );
}
