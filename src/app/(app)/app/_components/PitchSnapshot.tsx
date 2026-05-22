import Link from 'next/link';
import { Box, Flex, Text } from '@chakra-ui/react';
import { ChevronRight } from 'lucide-react';
import type { PitchSnapshotItem } from './types';

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string; border: string }> = {
  sent: {
    label: 'Gesendet',
    bg: 'var(--frost)',
    color: 'var(--mute)',
    border: 'var(--mist)',
  },
  delivered: {
    label: 'Zugestellt',
    bg: 'rgba(74,124,92,0.12)',
    color: 'var(--forest)',
    border: 'rgba(74,124,92,0.25)',
  },
  answered: {
    label: 'Geantwortet',
    bg: 'rgba(34,197,94,0.10)',
    color: '#166534',
    border: 'rgba(34,197,94,0.20)',
  },
  ignored: {
    label: 'Ignoriert',
    bg: 'rgba(234,179,8,0.10)',
    color: '#854D0E',
    border: 'rgba(234,179,8,0.22)',
  },
  bounced: {
    label: 'Gebounced',
    bg: 'rgba(239,68,68,0.08)',
    color: '#991B1B',
    border: 'rgba(239,68,68,0.18)',
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_BADGE[status] ?? STATUS_BADGE.sent;
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      fontFamily="var(--font-sans)"
      fontSize="11px"
      fontWeight={500}
      letterSpacing="0.04em"
      borderRadius="var(--radius-full)"
      px="10px"
      py="3px"
      bg={cfg.bg}
      color={cfg.color}
      border="1px solid"
      borderColor={cfg.border}
      whiteSpace="nowrap"
    >
      {cfg.label}
    </Box>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

function getNextFollowup(
  followups: PitchSnapshotItem['followups']
): string {
  const pending = followups
    .filter((f) => f.status === 'pending' && f.scheduled_for)
    .sort((a, b) =>
      new Date(a.scheduled_for!).getTime() - new Date(b.scheduled_for!).getTime()
    );
  if (!pending.length) return '—';
  return `FU${pending[0].level} · ${formatDate(pending[0].scheduled_for!)}`;
}

interface Props {
  pitches: PitchSnapshotItem[];
}

export function PitchSnapshot({ pitches }: Props) {
  return (
    <Box
      bg="rgba(248,248,250,0.85)"
      backdropFilter="blur(12px) saturate(1.4)"
      border="1px solid rgba(14,14,12,0.08)"
      borderRadius="var(--radius-5)"
      p={6}
      boxShadow="var(--shadow-cool-2)"
      display="flex"
      flexDirection="column"
      h="100%"
    >
      {/* Header */}
      <Flex justify="space-between" align="center" mb={5}>
        <Box>
          <Text
            fontFamily="var(--font-mono)"
            fontSize="10px"
            letterSpacing="0.10em"
            textTransform="uppercase"
            color="var(--mute)"
            mb={1}
          >
            — Pitch Tracker
          </Text>
          <Text
            fontFamily="var(--font-display)"
            fontSize="20px"
            fontStyle="italic"
            letterSpacing="-0.02em"
            color="var(--ink)"
          >
            Letzte Pitches
          </Text>
        </Box>
      </Flex>

      {/* Column header */}
      <Flex
        gap={3}
        pb={2}
        mb={1}
        borderBottom="1px solid var(--mist)"
      >
        <Text
          flex={2}
          fontFamily="var(--font-mono)"
          fontSize="10px"
          letterSpacing="0.08em"
          textTransform="uppercase"
          color="var(--mute)"
        >
          Name
        </Text>
        <Text
          flex={1}
          fontFamily="var(--font-mono)"
          fontSize="10px"
          letterSpacing="0.08em"
          textTransform="uppercase"
          color="var(--mute)"
        >
          Datum
        </Text>
        <Text
          w="90px"
          fontFamily="var(--font-mono)"
          fontSize="10px"
          letterSpacing="0.08em"
          textTransform="uppercase"
          color="var(--mute)"
        >
          Status
        </Text>
        <Text
          flex={1}
          fontFamily="var(--font-mono)"
          fontSize="10px"
          letterSpacing="0.08em"
          textTransform="uppercase"
          color="var(--mute)"
        >
          Follow-Up
        </Text>
      </Flex>

      {/* Rows */}
      {pitches.length === 0 && (
        <Box py={8} textAlign="center">
          <Text fontSize="14px" color="var(--mute)">
            Noch keine Pitches gesendet.
          </Text>
        </Box>
      )}

      <Box flex={1}>
        {pitches.map((p, i) => (
          <Flex
            key={p.id}
            gap={3}
            align="center"
            py={3}
            borderBottom={i < pitches.length - 1 ? '1px solid var(--mist)' : 'none'}
          >
            <Box flex={2} minW={0}>
              <Text
                fontFamily="var(--font-sans)"
                fontSize="13px"
                fontWeight={500}
                color="var(--ink)"
                noOfLines={1}
              >
                {p.prospect.first_name} {p.prospect.last_name}
              </Text>
              {p.prospect.company && (
                <Text fontSize="11px" color="var(--mute)" noOfLines={1}>
                  {p.prospect.company}
                </Text>
              )}
            </Box>
            <Text flex={1} fontSize="12px" color="var(--mute)" whiteSpace="nowrap">
              {formatDate(p.sent_at)}
            </Text>
            <Box w="90px">
              <StatusBadge status={p.status} />
            </Box>
            <Text
              flex={1}
              fontSize="12px"
              color="var(--mute)"
              fontFamily="var(--font-mono)"
              letterSpacing="0.04em"
              whiteSpace="nowrap"
            >
              {getNextFollowup(p.followups)}
            </Text>
          </Flex>
        ))}
      </Box>

      {/* Footer */}
      <Box mt={5} pt={4} borderTop="1px solid var(--mist)">
        <Link
          href="/app/pitch-tracker"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--ink)',
            borderBottom: '1px solid var(--ink)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Alle Pitches
          <ChevronRight size={14} strokeWidth={1.5} />
        </Link>
      </Box>
    </Box>
  );
}
