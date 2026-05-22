'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Box, Flex, Text } from '@chakra-ui/react';
import { ChevronRight, AlertCircle, Calendar } from 'lucide-react';
import type { CrmSnapshotLead } from './types';

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

interface LeadRowProps {
  lead: CrmSnapshotLead;
  onClick: (id: string) => void;
  accentColor: string;
}

function LeadRow({ lead, onClick, accentColor }: LeadRowProps) {
  return (
    <Flex
      align="center"
      gap={3}
      py={3}
      px={3}
      borderLeft="2px solid"
      borderLeftColor={accentColor}
      borderRadius="0 var(--radius-2) var(--radius-2) 0"
      cursor="pointer"
      transition="all 150ms cubic-bezier(0.4,0,0.2,1)"
      _hover={{
        bg: 'rgba(14,14,12,0.03)',
        borderLeftColor: 'var(--forest)',
      }}
      onClick={() => onClick(lead.id)}
    >
      <Box flex={1} minW={0}>
        <Text
          fontFamily="var(--font-sans)"
          fontSize="13px"
          fontWeight={500}
          color="var(--ink)"
          noOfLines={1}
        >
          {lead.prospect.first_name} {lead.prospect.last_name}
        </Text>
        {lead.prospect.company && (
          <Text fontSize="11px" color="var(--mute)" noOfLines={1}>
            {lead.prospect.company}
          </Text>
        )}
      </Box>
      {lead.nextAppointmentAt && (
        <Text
          fontSize="12px"
          color="var(--mute)"
          fontFamily="var(--font-mono)"
          letterSpacing="0.04em"
          whiteSpace="nowrap"
          flexShrink={0}
        >
          {lead.column === 'heute_fällig'
            ? formatTime(lead.nextAppointmentAt)
            : formatDateShort(lead.nextAppointmentAt)}
        </Text>
      )}
      <Box color="var(--mute)" flexShrink={0}>
        <ChevronRight size={14} strokeWidth={1.5} />
      </Box>
    </Flex>
  );
}

interface Props {
  heuteFällig: CrmSnapshotLead[];
  neuTerminieren: CrmSnapshotLead[];
}

export function CrmSnapshot({ heuteFällig, neuTerminieren }: Props) {
  const router = useRouter();

  function handleLeadClick(leadId: string) {
    router.push(`/app/crm?lead=${leadId}`);
  }

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
            — CRM
          </Text>
          <Text
            fontFamily="var(--font-display)"
            fontSize="20px"
            fontStyle="italic"
            letterSpacing="-0.02em"
            color="var(--ink)"
          >
            Heute & Offen
          </Text>
        </Box>
      </Flex>

      {/* Heute fällig */}
      <Box mb={5}>
        <Flex align="center" gap={2} mb={3}>
          <Calendar size={13} strokeWidth={1.5} color="var(--forest)" />
          <Text
            fontFamily="var(--font-mono)"
            fontSize="10px"
            letterSpacing="0.10em"
            textTransform="uppercase"
            color="var(--forest)"
            fontWeight={500}
          >
            Heute fällig
          </Text>
        </Flex>

        {heuteFällig.length === 0 ? (
          <Box
            bg="rgba(74,124,92,0.06)"
            border="1px solid rgba(74,124,92,0.15)"
            borderRadius="var(--radius-3)"
            px={3}
            py={2}
          >
            <Text fontSize="12px" color="var(--forest)">
              Keine fälligen Leads heute
            </Text>
          </Box>
        ) : (
          <Box>
            {heuteFällig.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                onClick={handleLeadClick}
                accentColor="var(--forest)"
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Divider */}
      <Box borderTop="1px dashed var(--mist)" mb={5} />

      {/* Neu terminieren */}
      <Box flex={1}>
        <Flex align="center" gap={2} mb={3}>
          <AlertCircle size={13} strokeWidth={1.5} color="#854D0E" />
          <Text
            fontFamily="var(--font-mono)"
            fontSize="10px"
            letterSpacing="0.10em"
            textTransform="uppercase"
            color="#854D0E"
            fontWeight={500}
          >
            Neu terminieren
          </Text>
        </Flex>

        {neuTerminieren.length === 0 ? (
          <Box
            bg="rgba(74,124,92,0.06)"
            border="1px solid rgba(74,124,92,0.15)"
            borderRadius="var(--radius-3)"
            px={3}
            py={2}
          >
            <Text fontSize="12px" color="var(--forest)">
              Alle Leads im Plan
            </Text>
          </Box>
        ) : (
          <Box>
            {neuTerminieren.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                onClick={handleLeadClick}
                accentColor="rgba(234,179,8,0.60)"
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box mt={5} pt={4} borderTop="1px solid var(--mist)">
        <Link
          href="/app/crm"
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
          CRM Board
          <ChevronRight size={14} strokeWidth={1.5} />
        </Link>
      </Box>
    </Box>
  );
}
