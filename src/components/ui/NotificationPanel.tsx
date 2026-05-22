'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Text, HStack, VStack, IconButton, Tooltip } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Calendar,
  AlertTriangle,
  UserPlus,
  TrendingUp,
  X,
  CheckCheck,
} from 'lucide-react';
import type { Notification, NotificationType } from '@/lib/types/database';

// ---------------------------------------------------------------------------
// Motion variant — scaleIn from motion.md
// ---------------------------------------------------------------------------

const panelVariants = {
  hidden:  { opacity: 0, scale: 0.97, y: -4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.65, 0, 0.35, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -4,
    transition: { duration: 0.18 },
  },
};

const itemVariants = {
  hidden:  { opacity: 0, x: -4 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] as const } },
};

// ---------------------------------------------------------------------------
// Type metadata
// ---------------------------------------------------------------------------

interface TypeMeta {
  icon: React.ElementType;
  color: string;
  bg: string;
}

const TYPE_META: Record<NotificationType, TypeMeta> = {
  followup_due: {
    icon: Bell,
    color: 'var(--forest)',
    bg: 'rgba(74,124,92,0.10)',
  },
  appointment_due: {
    icon: Calendar,
    color: 'var(--ink)',
    bg: 'rgba(14,14,12,0.06)',
  },
  appointment_rescheduled: {
    icon: AlertTriangle,
    color: '#854D0E',
    bg: 'rgba(234,179,8,0.10)',
  },
  reschedule_needed: {
    icon: AlertTriangle,
    color: '#854D0E',
    bg: 'rgba(234,179,8,0.10)',
  },
  lead_created: {
    icon: UserPlus,
    color: 'var(--forest)',
    bg: 'rgba(74,124,92,0.10)',
  },
  deal_updated: {
    icon: TrendingUp,
    color: 'var(--forest)',
    bg: 'rgba(74,124,92,0.10)',
  },
};

// ---------------------------------------------------------------------------
// Relative time helper
// ---------------------------------------------------------------------------

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins  <  1)  return 'Gerade eben';
  if (mins  < 60)  return `Vor ${mins} Min`;
  if (hours < 24)  return `Vor ${hours} Std`;
  if (days  === 1) return 'Gestern';
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

// ---------------------------------------------------------------------------
// Navigation helper
// ---------------------------------------------------------------------------

function notificationRoute(n: Notification): string {
  if (n.reference_table === 'followups') return '/app/pitch-tracker';
  return '/app/crm';
}

// ---------------------------------------------------------------------------
// NotificationItem
// ---------------------------------------------------------------------------

interface ItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onNavigate: (n: Notification) => void;
}

function NotificationItem({ notification: n, onMarkRead, onNavigate }: ItemProps) {
  const meta = TYPE_META[n.type] ?? TYPE_META.lead_created;
  const Icon = meta.icon;

  return (
    <motion.div variants={itemVariants}>
      <Box
        as="button"
        w="100%"
        textAlign="left"
        display="flex"
        alignItems="flex-start"
        gap="12px"
        px="16px"
        py="12px"
        position="relative"
        bg={n.is_read ? 'transparent' : 'rgba(74,124,92,0.04)'}
        borderBottom="1px solid"
        borderColor="var(--mist)"
        cursor="pointer"
        transition="background 200ms ease"
        _hover={{ bg: 'rgba(14,14,12,0.03)' }}
        onClick={() => onNavigate(n)}
      >
        {/* Unread dot */}
        {!n.is_read && (
          <Box
            position="absolute"
            left="6px"
            top="50%"
            transform="translateY(-50%)"
            w="5px"
            h="5px"
            borderRadius="var(--radius-full)"
            bg="var(--forest)"
            flexShrink={0}
          />
        )}

        {/* Icon */}
        <Box
          flexShrink={0}
          w="32px"
          h="32px"
          borderRadius="var(--radius-3)"
          bg={meta.bg}
          display="flex"
          alignItems="center"
          justifyContent="center"
          mt="2px"
        >
          <Icon size={15} strokeWidth={1.75} color={meta.color} />
        </Box>

        {/* Content */}
        <Box flex={1} minW={0}>
          <Text
            fontFamily="var(--font-sans)"
            fontSize="13px"
            fontWeight={n.is_read ? 400 : 500}
            color="var(--ink)"
            lineHeight="1.35"
            noOfLines={1}
          >
            {n.title}
          </Text>
          {n.body && (
            <Text
              fontFamily="var(--font-sans)"
              fontSize="12px"
              color="var(--mute)"
              lineHeight="1.4"
              noOfLines={2}
              mt="2px"
            >
              {n.body}
            </Text>
          )}
          <Text
            fontFamily="var(--font-sans)"
            fontSize="11px"
            color="var(--mute)"
            opacity={0.7}
            mt="4px"
          >
            {relativeTime(n.created_at)}
          </Text>
        </Box>

        {/* Mark-read button */}
        {!n.is_read && (
          <Tooltip label="Als gelesen markieren" placement="left">
            <Box
              as="span"
              flexShrink={0}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onMarkRead(n.id);
              }}
              w="24px"
              h="24px"
              borderRadius="var(--radius-2)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              opacity={0}
              _groupHover={{ opacity: 1 }}
              transition="opacity 150ms ease"
              _hover={{ bg: 'rgba(14,14,12,0.06)' }}
              color="var(--mute)"
            >
              <X size={12} strokeWidth={2} />
            </Box>
          </Tooltip>
        )}
      </Box>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// NotificationPanel (exported)
// ---------------------------------------------------------------------------

interface Props {
  isOpen: boolean;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export function NotificationPanel({ isOpen, notifications, onMarkRead, onMarkAllRead }: Props) {
  const router = useRouter();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  function handleNavigate(n: Notification) {
    if (!n.is_read) onMarkRead(n.id);
    router.push(notificationRoute(n));
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="notification-panel"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            position: 'absolute',
            top: '48px',
            right: 0,
            width: '380px',
            zIndex: 50,
            transformOrigin: 'top right',
          }}
        >
          <Box
            bg="var(--paper)"
            border="1px solid"
            borderColor="var(--mist)"
            borderRadius="var(--radius-4)"
            boxShadow="0 8px 32px rgba(14,14,12,0.12), 0 2px 8px rgba(14,14,12,0.06)"
            overflow="hidden"
          >
            {/* Header */}
            <HStack
              px="16px"
              py="12px"
              justify="space-between"
              borderBottom="1px solid"
              borderColor="var(--mist)"
            >
              <HStack gap="8px">
                <Text
                  fontFamily="var(--font-sans)"
                  fontSize="13px"
                  fontWeight={600}
                  color="var(--ink)"
                  letterSpacing="-0.01em"
                >
                  Benachrichtigungen
                </Text>
                {unreadCount > 0 && (
                  <Box
                    bg="var(--forest)"
                    color="var(--paper)"
                    borderRadius="var(--radius-full)"
                    fontSize="10px"
                    fontFamily="var(--font-sans)"
                    fontWeight={600}
                    lineHeight={1}
                    minW="18px"
                    h="18px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    px="5px"
                  >
                    {unreadCount}
                  </Box>
                )}
              </HStack>

              {unreadCount > 0 && (
                <Tooltip label="Alle als gelesen markieren" placement="bottom">
                  <IconButton
                    aria-label="Alle gelesen"
                    variant="ghost"
                    size="sm"
                    h="28px"
                    minW="28px"
                    px="6px"
                    onClick={onMarkAllRead}
                    icon={<CheckCheck size={14} strokeWidth={2} color="var(--mute)" />}
                    _hover={{ bg: 'rgba(14,14,12,0.05)' }}
                  />
                </Tooltip>
              )}
            </HStack>

            {/* List */}
            <Box maxH="420px" overflowY="auto" css={{ scrollbarWidth: 'thin' }}>
              {notifications.length === 0 ? (
                <VStack gap="8px" py="40px" px="16px" opacity={0.5}>
                  <Bell size={28} strokeWidth={1.25} color="var(--mute)" />
                  <Text
                    fontFamily="var(--font-sans)"
                    fontSize="13px"
                    color="var(--mute)"
                    textAlign="center"
                  >
                    Keine Benachrichtigungen
                  </Text>
                </VStack>
              ) : (
                <motion.div
                  variants={{ visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }}
                  initial="hidden"
                  animate="visible"
                >
                  {notifications.map(n => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onMarkRead={onMarkRead}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </motion.div>
              )}
            </Box>

            {/* Footer */}
            {notifications.length > 0 && (
              <Box
                px="16px"
                py="10px"
                borderTop="1px solid"
                borderColor="var(--mist)"
              >
                <Text
                  fontFamily="var(--font-sans)"
                  fontSize="11px"
                  color="var(--mute)"
                  opacity={0.6}
                  textAlign="center"
                >
                  {notifications.length === 1
                    ? '1 Benachrichtigung'
                    : `${notifications.length} Benachrichtigungen`}
                </Text>
              </Box>
            )}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
