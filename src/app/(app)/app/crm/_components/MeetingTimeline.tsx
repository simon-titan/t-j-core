'use client';

import { Box, Text, VStack, HStack, Badge } from '@chakra-ui/react';
import { CheckCircle2, XCircle, RotateCcw, Clock, Ban, Notebook } from 'lucide-react';
import type { KanbanAppointment } from './types';
import { MEETING_TYPE_LABELS, OUTCOME_LABELS } from './types';

interface Props {
  appointments: KanbanAppointment[];
  onOpenNotes?: (appt: KanbanAppointment) => void;
}

function AppointmentStatusIcon({ status }: { status: KanbanAppointment['status'] }) {
  if (status === 'completed')
    return <CheckCircle2 size={14} strokeWidth={1.5} color="var(--forest)" />;
  if (status === 'rescheduled' || status === 'cancelled')
    return <RotateCcw size={14} strokeWidth={1.5} color="#854D0E" />;
  if (status === 'no_show')
    return <XCircle size={14} strokeWidth={1.5} color="#991B1B" />;
  if (status === 'scheduled')
    return <Clock size={14} strokeWidth={1.5} color="var(--mute)" />;
  return <Ban size={14} strokeWidth={1.5} color="var(--mute)" />;
}

function statusLabel(status: KanbanAppointment['status']): string {
  const map: Record<string, string> = {
    scheduled: 'Geplant',
    completed: 'Abgeschlossen',
    rescheduled: 'Neu terminiert',
    cancelled: 'Abgesagt',
    no_show: 'No Show',
  };
  return map[status] ?? status;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MeetingTimeline({ appointments, onOpenNotes }: Props) {
  const sorted = [...appointments].sort(
    (a, b) =>
      new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
  );

  if (sorted.length === 0) {
    return (
      <Box py="var(--space-6)" textAlign="center">
        <Text
          fontFamily="var(--font-mono)"
          fontSize="11px"
          letterSpacing="0.08em"
          textTransform="uppercase"
          color="var(--mist)"
        >
          Noch keine Meetings
        </Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={0}>
      {sorted.map((appt, idx) => {
        const latestOutcome = appt.meeting_outcomes
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )[0];

        return (
          <Box key={appt.id} position="relative" pl="var(--space-6)">
            {/* Timeline line */}
            {idx < sorted.length - 1 && (
              <Box
                position="absolute"
                left="7px"
                top="20px"
                bottom={0}
                w="1px"
                bg="var(--mist)"
              />
            )}

            {/* Timeline dot */}
            <Box
              position="absolute"
              left={0}
              top="6px"
              w="14px"
              h="14px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <AppointmentStatusIcon status={appt.status} />
            </Box>

            <Box pb="var(--space-6)">
              <HStack spacing="var(--space-3)" mb={1} flexWrap="wrap" justify="space-between">
                <HStack spacing="var(--space-3)" flexWrap="wrap" flex={1} minW={0}>
                <Text
                  fontFamily="var(--font-sans)"
                  fontSize="13px"
                  fontWeight={500}
                  color="var(--ink)"
                >
                  {appt.title}
                </Text>
                {appt.meeting_type && (
                  <Box
                    bg="rgba(74,124,92,0.10)"
                    color="var(--forest)"
                    border="1px solid rgba(74,124,92,0.20)"
                    borderRadius="var(--radius-full)"
                    px="8px"
                    py="1px"
                    fontFamily="var(--font-sans)"
                    fontSize="11px"
                    fontWeight={500}
                    letterSpacing="0.03em"
                  >
                    {MEETING_TYPE_LABELS[appt.meeting_type]}
                  </Box>
                )}
                <Box
                  bg={
                    appt.status === 'completed'
                      ? 'rgba(34,197,94,0.08)'
                      : appt.status === 'scheduled'
                      ? 'var(--frost)'
                      : 'rgba(234,179,8,0.08)'
                  }
                  color={
                    appt.status === 'completed'
                      ? '#166534'
                      : appt.status === 'scheduled'
                      ? 'var(--mute)'
                      : '#854D0E'
                  }
                  border="1px solid"
                  borderColor={
                    appt.status === 'completed'
                      ? 'rgba(34,197,94,0.20)'
                      : appt.status === 'scheduled'
                      ? 'var(--mist)'
                      : 'rgba(234,179,8,0.20)'
                  }
                  borderRadius="var(--radius-full)"
                  px="8px"
                  py="1px"
                  fontFamily="var(--font-sans)"
                  fontSize="11px"
                  fontWeight={500}
                >
                  {statusLabel(appt.status)}
                </Box>
                </HStack>

                {/* Notes button */}
                {onOpenNotes && (
                  <Box
                    as="button"
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); onOpenNotes(appt); }}
                    display="flex"
                    alignItems="center"
                    gap="4px"
                    px="8px"
                    py="4px"
                    borderRadius="var(--radius-2)"
                    border="1px solid var(--mist)"
                    bg="var(--frost)"
                    color="var(--mute)"
                    fontFamily="var(--font-sans)"
                    fontSize="11px"
                    flexShrink={0}
                    _hover={{ bg: 'var(--mist)', color: 'var(--forest)', borderColor: 'rgba(74,124,92,0.30)' }}
                    transition="all 150ms ease"
                    title="Meeting Notizen öffnen"
                  >
                    <Notebook size={11} strokeWidth={1.5} />
                    {appt.meeting_notes?.length > 0 && (
                      <span>{appt.meeting_notes.length}</span>
                    )}
                    Notizen
                  </Box>
                )}
              </HStack>

              <Text
                fontFamily="var(--font-mono)"
                fontSize="11px"
                letterSpacing="0.04em"
                color="var(--mute)"
                mb={latestOutcome ? 2 : 0}
              >
                {formatDate(appt.scheduled_at)}
                {appt.duration_minutes && ` · ${appt.duration_minutes} min`}
                {appt.location && ` · ${appt.location}`}
              </Text>

              {latestOutcome && (
                <Box
                  bg="var(--frost)"
                  border="1px solid var(--mist)"
                  borderRadius="var(--radius-2)"
                  p="var(--space-3)"
                  mt={1}
                >
                  <Text
                    fontFamily="var(--font-mono)"
                    fontSize="10px"
                    letterSpacing="0.10em"
                    textTransform="uppercase"
                    color="var(--mute)"
                    mb={1}
                  >
                    Outcome · {OUTCOME_LABELS[latestOutcome.outcome]}
                  </Text>
                  {latestOutcome.summary && (
                    <Text
                      fontFamily="var(--font-sans)"
                      fontSize="13px"
                      color="var(--ink)"
                      lineHeight={1.5}
                    >
                      {latestOutcome.summary}
                    </Text>
                  )}
                  {latestOutcome.next_steps && (
                    <Text
                      fontFamily="var(--font-sans)"
                      fontSize="12px"
                      color="var(--mute)"
                      mt={1}
                    >
                      Next: {latestOutcome.next_steps}
                    </Text>
                  )}
                </Box>
              )}

              {appt.notes && !latestOutcome && (
                <Text
                  fontFamily="var(--font-sans)"
                  fontSize="12px"
                  color="var(--mute)"
                  lineHeight={1.5}
                  mt={1}
                >
                  {appt.notes}
                </Text>
              )}
            </Box>
          </Box>
        );
      })}
    </VStack>
  );
}
