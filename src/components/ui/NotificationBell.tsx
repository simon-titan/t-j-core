'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Box, IconButton, Tooltip, useOutsideClick } from '@chakra-ui/react';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Notification } from '@/lib/types/database';
import { NotificationPanel } from './NotificationPanel';

interface Props {
  userId: string;
}

export function NotificationBell({ userId }: Props) {
  const [isOpen, setIsOpen]             = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]   = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref: containerRef,
    handler: () => setIsOpen(false),
  });

  // Fetch full list (called on open + on Realtime change)
  const fetchNotifications = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    const rows = (data ?? []) as Notification[];
    setNotifications(rows);
    setUnreadCount(rows.filter(n => !n.is_read).length);
  }, [userId]);

  useEffect(() => {
    fetchNotifications();

    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        () => fetchNotifications()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchNotifications]);

  // Mark a single notification as read
  const markRead = useCallback(async (id: string) => {
    const supabase = createClient();
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId);

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [userId]);

  // Mark all notifications as read
  const markAllRead = useCallback(async () => {
    const supabase = createClient();
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [userId]);

  const displayCount = unreadCount > 99 ? '99+' : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <Box ref={containerRef} position="relative" display="inline-flex">
      <Tooltip label="Benachrichtigungen" placement="bottom" isDisabled={isOpen}>
        <Box position="relative" display="inline-flex">
          <IconButton
            aria-label="Benachrichtigungen"
            variant="icon"
            icon={<Bell size={20} strokeWidth={1.5} />}
            onClick={() => setIsOpen(prev => !prev)}
          />
          {displayCount && (
            <Box
              position="absolute"
              top="-2px"
              right="-2px"
              bg="var(--ink)"
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
              px="4px"
              border="2px solid var(--paper)"
              pointerEvents="none"
            >
              {displayCount}
            </Box>
          )}
        </Box>
      </Tooltip>

      <NotificationPanel
        isOpen={isOpen}
        notifications={notifications}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
      />
    </Box>
  );
}
