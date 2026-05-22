'use client';

import { useState } from 'react';
import { VStack, Box, Text, HStack } from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/client';
import type { PendingFollowup, Urgency } from './types';
import { getUrgency } from './types';
import { FollowUpCard } from './FollowUpCard';
import { t } from '@/lib/toast';

interface Props {
  followups: PendingFollowup[];
}

const GROUPS: { urgency: Urgency; label: string; color: string }[] = [
  { urgency: 'overdue', label: 'Überfällig',  color: '#991B1B' },
  { urgency: 'today',   label: 'Heute',       color: 'var(--warning)' },
  { urgency: 'soon',    label: 'Bald (≤ 2d)', color: 'var(--leaf)' },
  { urgency: 'future',  label: 'Zukünftig',   color: 'var(--mute)' },
];

export function FollowUpList({ followups: initial }: Props) {
  const [items, setItems]     = useState<PendingFollowup[]>(initial);
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

  async function updateStatus(id: string, status: 'sent' | 'skipped') {
    setLoading(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('followups') as any)
      .update({ status, sent_at: status === 'sent' ? new Date().toISOString() : null })
      .eq('id', id);
    if (error) {
      t.error('Follow-Up konnte nicht aktualisiert werden');
    } else {
      setItems(prev => prev.filter(f => f.id !== id));
      t.success(status === 'sent' ? 'Follow-Up als gesendet markiert' : 'Follow-Up übersprungen');
    }
    setLoading(null);
  }

  const grouped = GROUPS.map(g => ({
    ...g,
    items: items.filter(f => getUrgency(f.scheduled_for) === g.urgency),
  })).filter(g => g.items.length > 0);

  if (items.length === 0) {
    return (
      <Box py={16} textAlign="center">
        <Text
          fontFamily="var(--font-display)"
          fontStyle="italic"
          fontSize="24px"
          color="var(--mute)"
          letterSpacing="-0.01em"
        >
          Keine ausstehenden Follow-Ups.
        </Text>
        <Text
          fontFamily="var(--font-sans)"
          fontSize="13px"
          color="var(--mute)"
          mt={2}
        >
          Alle Follow-Ups wurden bearbeitet.
        </Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={7}>
      {grouped.map(group => (
        <Box key={group.urgency}>
          {/* Group Header */}
          <HStack spacing={2} mb={3}>
            <Box w="6px" h="6px" borderRadius="full" bg={group.color} flexShrink={0} />
            <Text
              fontFamily="var(--font-mono)"
              fontSize="10px"
              letterSpacing="0.12em"
              textTransform="uppercase"
              color={group.color}
              fontWeight={500}
            >
              {group.label}
            </Text>
            <Box flex={1} h="1px" bg="var(--mist)" />
            <Text
              fontFamily="var(--font-mono)"
              fontSize="10px"
              letterSpacing="0.06em"
              color="var(--mute)"
            >
              {group.items.length}
            </Text>
          </HStack>

          {/* Cards */}
          <VStack align="stretch" spacing={3}>
            {group.items.map(f => (
              <FollowUpCard
                key={f.id}
                followup={f}
                onSent={id => updateStatus(id, 'sent')}
                onSkip={id => updateStatus(id, 'skipped')}
                isLoading={loading === f.id}
              />
            ))}
          </VStack>
        </Box>
      ))}
    </VStack>
  );
}
