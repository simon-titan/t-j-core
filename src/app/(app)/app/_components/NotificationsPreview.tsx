'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Box, Flex, Text } from '@chakra-ui/react';
import {
  Bell,
  Calendar,
  AlertTriangle,
  UserPlus,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { DashboardNotification } from './types';
import { NotificationsPreviewSkeleton } from './DashboardSkeletons';

const TYPE_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  followup_due: { icon: Bell, color: 'var(--forest)', bg: 'rgba(74,124,92,0.10)' },
  appointment_due: { icon: Calendar, color: 'var(--ink)', bg: 'rgba(14,14,12,0.06)' },
  appointment_rescheduled: { icon: AlertTriangle, color: '#854D0E', bg: 'rgba(234,179,8,0.10)' },
  reschedule_needed: { icon: AlertTriangle, color: '#854D0E', bg: 'rgba(234,179,8,0.10)' },
  lead_created: { icon: UserPlus, color: 'var(--forest)', bg: 'rgba(74,124,92,0.10)' },
  deal_updated: { icon: TrendingUp, color: 'var(--forest)', bg: 'rgba(74,124,92,0.10)' },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return 'Gerade eben';
  if (mins  < 60) return `Vor ${mins} Min`;
  if (hours < 24) return `Vor ${hours} Std`;
  if (days  === 1) return 'Gestern';
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

function notificationRoute(n: DashboardNotification): string {
  if (n.reference_table === 'followups') return '/app/pitch-tracker';
  return '/app/crm';
}

interface Props {
  initialNotifications: DashboardNotification[];
}

export function NotificationsPreview({ initialNotifications }: Props) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<DashboardNotification[]>(initialNotifications);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialNotifications.length > 0) return;
    setLoading(true);
    const supabase = createClient();
    supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setNotifications((data as DashboardNotification[]) ?? []);
        setLoading(false);
      });
  }, [initialNotifications.length]);

  if (loading) return <NotificationsPreviewSkeleton />;

  if (notifications.length === 0) return null;

  async function handleClick(n: DashboardNotification) {
    const supabase = createClient();
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', n.id);
    setNotifications((prev) => prev.filter((x) => x.id !== n.id));
    router.push(notificationRoute(n));
  }

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
      <Flex justify="space-between" align="center" mb={4}>
        <Box>
          <Text
            fontFamily="var(--font-mono)"
            fontSize="10px"
            letterSpacing="0.10em"
            textTransform="uppercase"
            color="var(--mute)"
            mb={1}
          >
            — Benachrichtigungen
          </Text>
          <Text
            fontFamily="var(--font-display)"
            fontSize="20px"
            fontStyle="italic"
            letterSpacing="-0.02em"
            color="var(--ink)"
          >
            Ungelesen
          </Text>
        </Box>
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
          bg="rgba(74,124,92,0.12)"
          color="var(--forest)"
          border="1px solid rgba(74,124,92,0.25)"
        >
          {notifications.length} neu
        </Box>
      </Flex>

      {/* List */}
      <Flex direction="column" gap={1}>
        {notifications.map((n) => {
          const meta = TYPE_META[n.type] ?? TYPE_META.lead_created;
          const Icon = meta.icon;
          return (
            <Box
              key={n.id}
              as="button"
              w="100%"
              textAlign="left"
              display="flex"
              alignItems="center"
              gap={3}
              px={3}
              py="10px"
              borderRadius="var(--radius-3)"
              cursor="pointer"
              transition="all 120ms cubic-bezier(0.4,0,0.2,1)"
              _hover={{ bg: 'rgba(14,14,12,0.04)' }}
              onClick={() => handleClick(n)}
            >
              <Flex
                align="center"
                justify="center"
                flexShrink={0}
                w="32px"
                h="32px"
                borderRadius="var(--radius-full)"
                bg={meta.bg}
              >
                <Icon size={14} strokeWidth={1.5} color={meta.color} />
              </Flex>
              <Box flex={1} minW={0}>
                <Text
                  fontFamily="var(--font-sans)"
                  fontSize="13px"
                  fontWeight={500}
                  color="var(--ink)"
                  noOfLines={1}
                >
                  {n.title}
                </Text>
                {n.body && (
                  <Text fontSize="12px" color="var(--mute)" noOfLines={1}>
                    {n.body}
                  </Text>
                )}
              </Box>
              <Text
                fontSize="11px"
                color="var(--mute)"
                fontFamily="var(--font-mono)"
                letterSpacing="0.04em"
                flexShrink={0}
              >
                {relativeTime(n.created_at)}
              </Text>
            </Box>
          );
        })}
      </Flex>

      {/* Footer hint */}
      <Box mt={4} pt={3} borderTop="1px solid var(--mist)">
        <Text fontSize="12px" color="var(--mute)">
          Alle Benachrichtigungen findest du in der Glocke oben rechts.
        </Text>
      </Box>
    </Box>
  );
}
