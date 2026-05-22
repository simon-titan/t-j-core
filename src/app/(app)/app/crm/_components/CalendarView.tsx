'use client';

import { useState, useMemo } from 'react';
import { Box, Text, HStack, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { KanbanLead, KanbanAppointment } from './types';
import { MEETING_TYPE_LABELS } from './types';

interface ApptWithLead {
  appt: KanbanAppointment;
  lead: KanbanLead;
}

interface Props {
  leads: KanbanLead[];
  onLeadOpen: (lead: KanbanLead) => void;
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

function getMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Mon=0, Sun=6
  const daysInMonth = lastDay.getDate();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const MEETING_TYPE_BG: Record<string, string> = {
  discovery: 'rgba(74,124,92,0.12)',
  demo: 'rgba(74,124,92,0.18)',
  proposal: 'rgba(234,179,8,0.12)',
  closing: 'rgba(74,124,92,0.24)',
  follow_up: 'var(--frost)',
  other: 'var(--frost)',
};
const MEETING_TYPE_TEXT: Record<string, string> = {
  discovery: 'var(--forest)',
  demo: 'var(--forest)',
  proposal: '#854D0E',
  closing: 'var(--glow)',
  follow_up: 'var(--mute)',
  other: 'var(--mute)',
};

export function CalendarView({ leads, onLeadOpen }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const grid = useMemo(() => getMonthGrid(year, month), [year, month]);

  const apptsByDay = useMemo(() => {
    const map = new Map<string, ApptWithLead[]>();
    leads.forEach((lead) => {
      lead.appointments.forEach((appt) => {
        const d = new Date(appt.scheduled_at);
        if (d.getFullYear() === year && d.getMonth() === month) {
          const key = d.getDate().toString();
          if (!map.has(key)) map.set(key, []);
          map.get(key)!.push({ appt, lead });
        }
      });
    });
    // Sort each day's appointments by time
    map.forEach((arr) => arr.sort((a, b) =>
      new Date(a.appt.scheduled_at).getTime() - new Date(b.appt.scheduled_at).getTime()
    ));
    return map;
  }, [leads, year, month]);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }
  function goToday() {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  }

  const today = new Date();

  return (
    <motion.div
      key="calendar"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
      style={{ height: '100%', overflowY: 'auto' }}
    >
      <Box pb="var(--space-6)">
        {/* Navigation */}
        <HStack justify="space-between" mb="var(--space-5)" align="center">
          <HStack spacing="var(--space-3)">
            <Box
              as="button"
              display="flex"
              alignItems="center"
              justifyContent="center"
              w="32px"
              h="32px"
              borderRadius="var(--radius-2)"
              border="1px solid"
              borderColor="var(--mist)"
              bg="var(--paper)"
              cursor="pointer"
              color="var(--mute)"
              _hover={{ bg: 'var(--frost)', color: 'var(--ink)' }}
              transition="all 150ms ease"
              onClick={prevMonth}
            >
              <ChevronLeft size={15} strokeWidth={2} />
            </Box>
            <Box
              as="button"
              display="flex"
              alignItems="center"
              justifyContent="center"
              w="32px"
              h="32px"
              borderRadius="var(--radius-2)"
              border="1px solid"
              borderColor="var(--mist)"
              bg="var(--paper)"
              cursor="pointer"
              color="var(--mute)"
              _hover={{ bg: 'var(--frost)', color: 'var(--ink)' }}
              transition="all 150ms ease"
              onClick={nextMonth}
            >
              <ChevronRight size={15} strokeWidth={2} />
            </Box>
          </HStack>

          <HStack spacing="var(--space-3)">
            <Text
              fontFamily="var(--font-display)"
              fontStyle="italic"
              fontSize="22px"
              fontWeight={600}
              color="var(--ink)"
              letterSpacing="-0.02em"
            >
              {MONTHS[month]} {year}
            </Text>
          </HStack>

          <Box
            as="button"
            px="12px"
            py="6px"
            borderRadius="var(--radius-2)"
            border="1px solid"
            borderColor="var(--mist)"
            bg="var(--paper)"
            cursor="pointer"
            fontFamily="var(--font-sans)"
            fontSize="12px"
            fontWeight={500}
            color="var(--mute)"
            _hover={{ bg: 'var(--frost)', color: 'var(--ink)' }}
            transition="all 150ms ease"
            onClick={goToday}
          >
            Heute
          </Box>
        </HStack>

        {/* Weekday headers */}
        <Box
          display="grid"
          gridTemplateColumns="repeat(7, 1fr)"
          gap="1px"
          mb="1px"
        >
          {WEEKDAYS.map((d) => (
            <Box key={d} py="var(--space-2)" textAlign="center">
              <Text
                fontFamily="var(--font-mono)"
                fontSize="10px"
                letterSpacing="0.12em"
                textTransform="uppercase"
                color="var(--mute)"
              >
                {d}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Calendar grid */}
        <Box
          display="grid"
          gridTemplateColumns="repeat(7, 1fr)"
          gap="1px"
          bg="var(--mist)"
          border="1px solid"
          borderColor="var(--mist)"
          borderRadius="var(--radius-3)"
          overflow="hidden"
        >
          {grid.map((day, i) => {
            if (!day) {
              return <Box key={`pad-${i}`} bg="var(--frost)" minH="110px" />;
            }

            const dayKey = day.getDate().toString();
            const appts = apptsByDay.get(dayKey) ?? [];
            const isToday = isSameDay(day, today);
            const isPast = day < today && !isToday;
            const visible = appts.slice(0, 3);
            const overflow = appts.length - visible.length;

            return (
              <Box
                key={day.getTime()}
                bg={isToday ? 'rgba(74,124,92,0.04)' : isPast ? 'var(--frost)' : 'var(--paper)'}
                minH="110px"
                p="var(--space-2)"
                position="relative"
              >
                {/* Day number */}
                <Box
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  w="24px"
                  h="24px"
                  borderRadius="full"
                  bg={isToday ? 'var(--forest)' : 'transparent'}
                  mb="4px"
                >
                  <Text
                    fontFamily="var(--font-mono)"
                    fontSize="12px"
                    fontWeight={isToday ? 700 : 400}
                    color={isToday ? 'var(--paper)' : isPast ? 'var(--mist)' : 'var(--mute)'}
                  >
                    {day.getDate()}
                  </Text>
                </Box>

                {/* Appointments */}
                <VStack spacing="2px" align="stretch">
                  {visible.map(({ appt, lead }) => {
                    const meetingType = appt.meeting_type ?? 'other';
                    const time = new Date(appt.scheduled_at).toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    return (
                      <Box
                        key={appt.id}
                        bg={MEETING_TYPE_BG[meetingType] ?? 'var(--frost)'}
                        borderRadius="var(--radius-1)"
                        px="4px"
                        py="2px"
                        cursor="pointer"
                        _hover={{ filter: 'brightness(0.96)' }}
                        transition="filter 120ms ease"
                        onClick={() => onLeadOpen(lead)}
                      >
                        <Text
                          fontFamily="var(--font-sans)"
                          fontSize="10px"
                          fontWeight={500}
                          color={MEETING_TYPE_TEXT[meetingType] ?? 'var(--mute)'}
                          noOfLines={1}
                        >
                          {time} {lead.prospect.first_name} {lead.prospect.last_name.charAt(0)}.
                        </Text>
                      </Box>
                    );
                  })}

                  {overflow > 0 && (
                    <Text
                      fontFamily="var(--font-mono)"
                      fontSize="9px"
                      color="var(--mute)"
                      letterSpacing="0.06em"
                    >
                      +{overflow} weitere
                    </Text>
                  )}
                </VStack>
              </Box>
            );
          })}
        </Box>
      </Box>
    </motion.div>
  );
}
