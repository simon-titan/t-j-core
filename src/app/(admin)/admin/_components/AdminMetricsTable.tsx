'use client';

import { useRouter } from 'next/navigation';
import { Box, Text } from '@chakra-ui/react';
import { TrendingUp } from 'lucide-react';

export interface OrgMetricRow {
  id:               string;
  name:             string;
  logo_url:         string | null;
  is_active:        boolean;
  member_count:     number;
  dm_count:         number;
  answer_count:     number;
  deal_count:       number;
  appointment_count: number;
}

interface Props {
  rows: OrgMetricRow[];
}

export function AdminMetricsTable({ rows }: Props) {
  const router = useRouter();

  return (
    <Box
      border="1px solid var(--mist)"
      borderRadius="var(--radius-3)"
      overflow="hidden"
      bg="var(--paper)"
    >
      {/* Table head */}
      <Box
        display="grid"
        gridTemplateColumns="2fr 100px 80px 80px 100px 80px 80px"
        gap={0}
        px={6}
        py={3}
        bg="var(--frost)"
        borderBottom="1px solid var(--mist)"
      >
        {['Organisation', 'Status', 'Benutzer', 'DMs', 'Antwortrate', 'Termine', 'Deals'].map(h => (
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

      {/* Rows */}
      {rows.length === 0 ? (
        <Box px={6} py={8} textAlign="center">
          <Text fontFamily="var(--font-sans)" fontSize="14px" color="var(--mute)">
            Keine Organisationen vorhanden.
          </Text>
        </Box>
      ) : (
        rows.map((row, i) => {
          const answerRate = row.dm_count > 0
            ? Math.round((row.answer_count / row.dm_count) * 100)
            : 0;

          return (
            <Box
              key={row.id}
              display="grid"
              gridTemplateColumns="2fr 100px 80px 80px 100px 80px 80px"
              gap={0}
              px={6}
              py={4}
              borderBottom={i < rows.length - 1 ? '1px solid var(--mist)' : undefined}
              cursor="pointer"
              transition="background 120ms var(--ease-default)"
              _hover={{ bg: 'rgba(14,14,12,0.02)' }}
              onClick={() => router.push(`/admin/orgs/${row.id}`)}
              alignItems="center"
            >
              {/* Org name + logo */}
              <Box display="flex" alignItems="center" gap={3}>
                <Box
                  w="32px"
                  h="32px"
                  borderRadius="var(--radius-2)"
                  bg="var(--forest)"
                  flexShrink={0}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  overflow="hidden"
                >
                  {row.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={row.logo_url}
                      alt={row.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Text fontFamily="var(--font-mono)" fontSize="11px" fontWeight={600} color="var(--paper)">
                      {row.name.slice(0, 2).toUpperCase()}
                    </Text>
                  )}
                </Box>
                <Text fontFamily="var(--font-sans)" fontSize="14px" fontWeight={500} color="var(--ink)">
                  {row.name}
                </Text>
              </Box>

              {/* Status */}
              <Box>
                <Box
                  display="inline-flex"
                  alignItems="center"
                  px="10px"
                  py="3px"
                  borderRadius="var(--radius-full)"
                  border="1px solid"
                  fontSize="11px"
                  fontFamily="var(--font-sans)"
                  fontWeight={500}
                  letterSpacing="0.03em"
                  bg={row.is_active ? 'rgba(74,124,92,0.10)' : 'rgba(239,68,68,0.07)'}
                  borderColor={row.is_active ? 'rgba(74,124,92,0.25)' : 'rgba(239,68,68,0.18)'}
                  color={row.is_active ? 'var(--forest)' : '#991B1B'}
                >
                  {row.is_active ? 'Aktiv' : 'Inaktiv'}
                </Box>
              </Box>

              {/* Member count */}
              <Text fontFamily="var(--font-mono)" fontSize="13px" color="var(--ink)">
                {row.member_count}
              </Text>

              {/* DM count */}
              <Text fontFamily="var(--font-mono)" fontSize="13px" color="var(--ink)">
                {row.dm_count.toLocaleString('de-DE')}
              </Text>

              {/* Answer rate */}
              <Box display="flex" alignItems="center" gap={2}>
                <Text fontFamily="var(--font-mono)" fontSize="13px" color="var(--ink)">
                  {answerRate}%
                </Text>
                {answerRate >= 20 && (
                  <TrendingUp size={12} strokeWidth={1.5} color="var(--leaf)" />
                )}
              </Box>

              {/* Appointment count */}
              <Text fontFamily="var(--font-mono)" fontSize="13px" color="var(--ink)">
                {row.appointment_count.toLocaleString('de-DE')}
              </Text>

              {/* Deal count */}
              <Text fontFamily="var(--font-mono)" fontSize="13px" color="var(--ink)">
                {row.deal_count}
              </Text>
            </Box>
          );
        })
      )}
    </Box>
  );
}
