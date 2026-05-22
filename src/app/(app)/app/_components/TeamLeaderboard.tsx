'use client';

import { useState, useEffect } from 'react';
import { Box, Flex, Text, Table, Thead, Tbody, Tr, Th, Td, Button, ButtonGroup } from '@chakra-ui/react';
import { Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { TeamMemberRow, DashboardTimeRange } from './types';
import { TeamTableSkeleton } from './DashboardSkeletons';

function getWeekStart(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getMonthStart(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

async function fetchTeamMetrics(
  orgId: string,
  currentUserId: string,
  range: DashboardTimeRange
): Promise<TeamMemberRow[]> {
  const supabase = createClient();
  const rangeStart = range === 'week' ? getWeekStart() : getMonthStart();
  const rangeEnd = new Date();
  rangeEnd.setHours(23, 59, 59, 999);

  const { data: members } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('organization_id', orgId);

  if (!members || members.length === 0) return [];

  const memberIds = members.map((m: { id: string }) => m.id);

  const [pitchesRes, answeredRes, appointmentsRes, closedRes] = await Promise.all([
    supabase
      .from('pitches')
      .select('sent_by')
      .in('sent_by', memberIds)
      .gte('sent_at', rangeStart.toISOString())
      .lte('sent_at', rangeEnd.toISOString()),
    supabase
      .from('pitches')
      .select('sent_by')
      .in('sent_by', memberIds)
      .eq('status', 'answered')
      .gte('sent_at', rangeStart.toISOString())
      .lte('sent_at', rangeEnd.toISOString()),
    supabase
      .from('appointments')
      .select('assigned_to')
      .in('assigned_to', memberIds)
      .in('status', ['scheduled', 'completed'])
      .gte('scheduled_at', rangeStart.toISOString())
      .lte('scheduled_at', rangeEnd.toISOString()),
    supabase
      .from('leads')
      .select('assigned_to')
      .in('assigned_to', memberIds)
      .eq('status', 'won'),
  ]);

  const dmsByUser: Record<string, number> = {};
  const answeredByUser: Record<string, number> = {};
  const apptsByUser: Record<string, number> = {};
  const closedByUser: Record<string, number> = {};

  for (const row of pitchesRes.data ?? []) {
    dmsByUser[row.sent_by] = (dmsByUser[row.sent_by] ?? 0) + 1;
  }
  for (const row of answeredRes.data ?? []) {
    answeredByUser[row.sent_by] = (answeredByUser[row.sent_by] ?? 0) + 1;
  }
  for (const row of appointmentsRes.data ?? []) {
    if (row.assigned_to) {
      apptsByUser[row.assigned_to] = (apptsByUser[row.assigned_to] ?? 0) + 1;
    }
  }
  for (const row of closedRes.data ?? []) {
    if (row.assigned_to) {
      closedByUser[row.assigned_to] = (closedByUser[row.assigned_to] ?? 0) + 1;
    }
  }

  const rows: TeamMemberRow[] = members.map((m: { id: string; full_name: string | null }) => {
    const dms = dmsByUser[m.id] ?? 0;
    const answered = answeredByUser[m.id] ?? 0;
    const rate = dms > 0 ? Math.round((answered / dms) * 100) : 0;
    return {
      userId: m.id,
      fullName: m.full_name ?? 'Unbekannt',
      dms,
      answerRate: rate,
      appointments: apptsByUser[m.id] ?? 0,
      closed: closedByUser[m.id] ?? 0,
      isCurrentUser: m.id === currentUserId,
    };
  });

  return rows.sort((a, b) => b.dms - a.dms);
}

interface Props {
  initialData: TeamMemberRow[];
  currentUserId: string;
  orgId: string;
}

export function TeamLeaderboard({ initialData, currentUserId, orgId }: Props) {
  const [range, setRange] = useState<DashboardTimeRange>('week');
  const [data, setData] = useState<TeamMemberRow[]>(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchTeamMetrics(orgId, currentUserId, range).then((rows) => {
      setData(rows);
      setLoading(false);
    });
  }, [range, orgId, currentUserId]);

  return (
    <Box
      bg="rgba(248,248,250,0.85)"
      backdropFilter="blur(12px) saturate(1.4)"
      border="1px solid rgba(14,14,12,0.08)"
      borderRadius="var(--radius-5)"
      p={6}
      boxShadow="var(--shadow-cool-2)"
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
            — Team
          </Text>
          <Flex align="center" gap={2}>
            <Users size={16} strokeWidth={1.5} color="var(--ink)" />
            <Text
              fontFamily="var(--font-display)"
              fontSize="20px"
              fontStyle="italic"
              letterSpacing="-0.02em"
              color="var(--ink)"
            >
              Leaderboard
            </Text>
          </Flex>
        </Box>
        <ButtonGroup size="sm" isAttached variant="outline">
          <Button
            fontFamily="var(--font-sans)"
            fontSize="12px"
            fontWeight={range === 'week' ? 500 : 400}
            bg={range === 'week' ? 'var(--ink)' : 'transparent'}
            color={range === 'week' ? 'var(--paper)' : 'var(--mute)'}
            borderColor="var(--mist)"
            _hover={{ bg: range === 'week' ? 'var(--forest-deep)' : 'rgba(14,14,12,0.04)' }}
            onClick={() => setRange('week')}
          >
            Diese Woche
          </Button>
          <Button
            fontFamily="var(--font-sans)"
            fontSize="12px"
            fontWeight={range === 'month' ? 500 : 400}
            bg={range === 'month' ? 'var(--ink)' : 'transparent'}
            color={range === 'month' ? 'var(--paper)' : 'var(--mute)'}
            borderColor="var(--mist)"
            _hover={{ bg: range === 'month' ? 'var(--forest-deep)' : 'rgba(14,14,12,0.04)' }}
            onClick={() => setRange('month')}
          >
            Dieser Monat
          </Button>
        </ButtonGroup>
      </Flex>

      {loading ? (
        <TeamTableSkeleton />
      ) : (
        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead>
              <Tr borderBottom="1px solid var(--mist)">
                {['Name', 'DMs', 'Antwortrate', 'Termine', 'Geclosed'].map((col) => (
                  <Th
                    key={col}
                    fontFamily="var(--font-mono)"
                    fontSize="10px"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color="var(--mute)"
                    borderColor="var(--mist)"
                    py={3}
                    px={3}
                  >
                    {col}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {data.map((row) => (
                <Tr
                  key={row.userId}
                  bg={row.isCurrentUser ? 'rgba(74,124,92,0.08)' : 'transparent'}
                  _hover={{ bg: row.isCurrentUser ? 'rgba(74,124,92,0.12)' : 'rgba(14,14,12,0.03)' }}
                  borderBottom="1px solid"
                  borderColor="var(--mist)"
                >
                  <Td
                    fontFamily="var(--font-sans)"
                    fontSize="13px"
                    fontWeight={row.isCurrentUser ? 500 : 400}
                    color="var(--ink)"
                    py={3}
                    px={3}
                    borderColor="transparent"
                  >
                    {row.fullName}
                    {row.isCurrentUser && (
                      <Text as="span" fontSize="10px" color="var(--forest)" ml={2} fontFamily="var(--font-mono)" letterSpacing="0.06em">
                        DU
                      </Text>
                    )}
                  </Td>
                  <Td fontSize="13px" color="var(--ink)" fontWeight={row.isCurrentUser ? 500 : 400} py={3} px={3} borderColor="transparent">
                    {row.dms}
                  </Td>
                  <Td py={3} px={3} borderColor="transparent">
                    <Flex align="center" gap={2}>
                      <Box
                        h="4px"
                        w="48px"
                        bg="var(--mist)"
                        borderRadius="var(--radius-full)"
                        overflow="hidden"
                        flexShrink={0}
                      >
                        <Box
                          h="100%"
                          w={`${row.answerRate}%`}
                          bg="var(--gradient-leaf-glow)"
                          borderRadius="var(--radius-full)"
                        />
                      </Box>
                      <Text fontSize="13px" color="var(--ink)" fontWeight={row.isCurrentUser ? 500 : 400}>
                        {row.answerRate}%
                      </Text>
                    </Flex>
                  </Td>
                  <Td fontSize="13px" color="var(--ink)" fontWeight={row.isCurrentUser ? 500 : 400} py={3} px={3} borderColor="transparent">
                    {row.appointments}
                  </Td>
                  <Td fontSize="13px" color="var(--ink)" fontWeight={row.isCurrentUser ? 500 : 400} py={3} px={3} borderColor="transparent">
                    {row.closed}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {data.length === 0 && (
            <Box py={6} textAlign="center">
              <Text fontSize="13px" color="var(--mute)">
                Keine Teamdaten für diesen Zeitraum.
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
