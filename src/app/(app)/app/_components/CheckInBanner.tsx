'use client';

import Link from 'next/link';
import { Box, Text } from '@chakra-ui/react';
import { CalendarCheck, ArrowRight } from 'lucide-react';

const MONTH_NAMES = [
  'Januar','Februar','März','April','Mai','Juni',
  'Juli','August','September','Oktober','November','Dezember',
];

interface Props {
  periodYear:  number;
  periodMonth: number;
}

export function CheckInBanner({ periodYear, periodMonth }: Props) {
  const monthName = MONTH_NAMES[periodMonth - 1];

  return (
    <Box
      as={Link}
      href="/app/checkin"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={4}
      bg="rgba(74,124,92,0.07)"
      border="1px solid rgba(74,124,92,0.22)"
      borderRadius="var(--radius-4)"
      px={5}
      py={4}
      mb={6}
      textDecoration="none"
      transition="all 140ms var(--ease-default)"
      _hover={{
        bg:          'rgba(74,124,92,0.12)',
        borderColor: 'rgba(74,124,92,0.35)',
      }}
    >
      <Box display="flex" alignItems="center" gap={3}>
        <Box
          w="36px"
          h="36px"
          borderRadius="var(--radius-2)"
          bg="rgba(74,124,92,0.12)"
          border="1px solid rgba(74,124,92,0.20)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <CalendarCheck size={17} strokeWidth={1.5} color="var(--forest)" />
        </Box>
        <Box>
          <Text
            fontFamily="var(--font-sans)"
            fontSize="14px"
            fontWeight={500}
            color="var(--forest)"
            lineHeight={1.3}
          >
            Monatlicher Check-In für {monthName} {periodYear} ausstehend
          </Text>
          <Text
            fontFamily="var(--font-sans)"
            fontSize="12px"
            color="var(--mute)"
            mt="2px"
          >
            Bitte fülle deinen Check-In aus — es dauert nur wenige Minuten.
          </Text>
        </Box>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        color="var(--forest)"
        flexShrink={0}
      >
        <Text fontFamily="var(--font-sans)" fontSize="13px" fontWeight={500}>
          Jetzt ausfüllen
        </Text>
        <ArrowRight size={14} strokeWidth={1.5} />
      </Box>
    </Box>
  );
}
