'use client';

import { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Select,
} from '@chakra-ui/react';
import { ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { KanbanLead, LeadStatus, MeetingSystem } from './types';
import { LEAD_STATUS_LABELS } from './types';

interface Props {
  lead: KanbanLead;
  onUpdate: (fields: { status?: LeadStatus; meeting_system?: MeetingSystem | null }) => void;
}

const selectStyle = {
  bg: 'var(--frost)',
  border: '1px solid',
  borderColor: 'var(--mist)',
  borderRadius: 'var(--radius-2)',
  fontFamily: 'var(--font-sans)',
  fontSize: '14px',
  color: 'var(--ink)',
  _hover: { borderColor: 'var(--mute)' },
  _focus: {
    borderColor: 'var(--leaf)',
    boxShadow: '0 0 0 3px rgba(74,124,92,0.12)',
  },
};

const ALL_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'qualified',
  'proposal',
  'negotiating',
  'won',
  'lost',
];

export function DealInfo({ lead, onUpdate }: Props) {
  const supabase = createClient();
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [meetingSystem, setMeetingSystem] = useState<MeetingSystem | ''>(
    lead.meeting_system ?? ''
  );
  const [saving, setSaving] = useState(false);

  const isDirty =
    status !== lead.status || (meetingSystem || null) !== lead.meeting_system;

  async function handleSave() {
    setSaving(true);
    await (supabase.from('leads') as any)
      .update({
        status,
        meeting_system: meetingSystem || null,
      })
      .eq('id', lead.id);

    onUpdate({
      status,
      meeting_system: (meetingSystem as MeetingSystem) || null,
    });
    setSaving(false);
  }

  const statusColorMap: Record<LeadStatus, string> = {
    new: 'var(--mute)',
    contacted: 'var(--mute)',
    qualified: 'var(--forest)',
    proposal: '#854D0E',
    negotiating: 'var(--forest)',
    won: 'var(--forest)',
    lost: '#991B1B',
  };

  return (
    <VStack align="stretch" spacing="var(--space-5)">
      {/* Status */}
      <Box>
        <Text
          fontFamily="var(--font-sans)"
          fontSize="13px"
          fontWeight={500}
          color="var(--ink)"
          mb="var(--space-2)"
        >
          Lead-Status
        </Text>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as LeadStatus)}
          {...selectStyle}
          icon={<ChevronDown size={14} />}
          color={statusColorMap[status]}
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {LEAD_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </Box>

      {/* Meeting System */}
      <Box>
        <Text
          fontFamily="var(--font-sans)"
          fontSize="13px"
          fontWeight={500}
          color="var(--ink)"
          mb="var(--space-2)"
        >
          Meeting-System
        </Text>
        <HStack spacing="var(--space-3)">
          {(['direct', 'two_meeting'] as const).map((val) => (
            <Box
              key={val}
              as="button"
              flex={1}
              onClick={() => setMeetingSystem(val)}
              bg={meetingSystem === val ? 'rgba(74,124,92,0.08)' : 'var(--frost)'}
              border="1px solid"
              borderColor={meetingSystem === val ? 'var(--leaf)' : 'var(--mist)'}
              borderRadius="var(--radius-2)"
              py="var(--space-3)"
              px="var(--space-4)"
              fontFamily="var(--font-sans)"
              fontSize="13px"
              fontWeight={meetingSystem === val ? 500 : 400}
              color={meetingSystem === val ? 'var(--forest)' : 'var(--ink)'}
              transition="all 150ms ease"
              _hover={{ borderColor: 'var(--mute)' }}
              textAlign="center"
            >
              {val === 'direct' ? 'Direkt (1 Meeting)' : '2-Meeting-System'}
            </Box>
          ))}
        </HStack>
      </Box>

      {/* Deal Values Summary */}
      {lead.deals.length > 0 && (
        <Box
          bg="var(--frost)"
          border="1px solid var(--mist)"
          borderRadius="var(--radius-2)"
          p="var(--space-4)"
        >
          <Text
            fontFamily="var(--font-mono)"
            fontSize="10px"
            letterSpacing="0.10em"
            textTransform="uppercase"
            color="var(--mute)"
            mb="var(--space-3)"
          >
            Deals
          </Text>
          <VStack align="stretch" spacing={2}>
            {lead.deals.map((deal) => (
              <HStack key={deal.id} justify="space-between">
                <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--ink)">
                  {deal.name}
                </Text>
                <HStack spacing={2}>
                  {deal.value !== null && (
                    <Text
                      fontFamily="var(--font-display)"
                      fontStyle="italic"
                      fontSize="16px"
                      color="var(--forest)"
                    >
                      {deal.value.toLocaleString('de-DE')} {deal.currency}
                    </Text>
                  )}
                  <Box
                    bg="rgba(74,124,92,0.10)"
                    color="var(--forest)"
                    borderRadius="var(--radius-full)"
                    px="8px"
                    py="1px"
                    fontFamily="var(--font-mono)"
                    fontSize="10px"
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                  >
                    {deal.stage}
                  </Box>
                </HStack>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}

      {/* Save */}
      <HStack justify="flex-end">
        <Button
          onClick={handleSave}
          isLoading={saving}
          isDisabled={!isDirty}
          bg={isDirty ? 'var(--ink)' : 'var(--frost)'}
          color={isDirty ? 'var(--paper)' : 'var(--mute)'}
          fontFamily="var(--font-sans)"
          fontSize="13px"
          fontWeight={500}
          borderRadius="var(--radius-2)"
          h="34px"
          px="var(--space-5)"
          _hover={{ bg: isDirty ? 'var(--forest-deep)' : undefined }}
          _active={{ transform: 'scale(0.97)' }}
          transition="all 150ms ease"
          cursor={isDirty ? 'pointer' : 'not-allowed'}
        >
          Speichern →
        </Button>
      </HStack>
    </VStack>
  );
}
