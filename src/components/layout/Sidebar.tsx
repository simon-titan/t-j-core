'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Text, Tooltip } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Building2, Users, Settings,
  Send, UserCheck, Calendar, RotateCcw, Home,
  ChevronLeft, KanbanSquare, BookOpen, CalendarCheck, Lock,
} from 'lucide-react';
import type { UserRole } from '@/lib/types/database';

// ─── Nav item definitions ───────────────────────────────────────────────────

interface NavItem {
  href:   string;
  label:  string;
  icon:   React.ElementType;
  locked?: boolean;
}

interface NavSection {
  label?: string;
  items:  NavItem[];
}

const NAV_BY_ROLE: Record<UserRole, NavSection[]> = {
  super_admin: [
    {
      items: [
        { href: '/admin',            label: 'Übersicht',      icon: LayoutDashboard },
        { href: '/admin/orgs',       label: 'Organisationen', icon: Building2 },
        { href: '/admin/onboarding', label: 'Onboarding',     icon: BookOpen },
      ],
    },
    {
      label: 'System',
      items: [
        { href: '/admin/system', label: 'System', icon: Settings },
      ],
    },
  ],
  org_admin: [
    {
      items: [
        { href: '/dashboard',             label: 'Overview',      icon: LayoutDashboard },
        { href: '/dashboard/pitches',     label: 'Pitches',       icon: Send },
        { href: '/dashboard/leads',       label: 'Leads',         icon: UserCheck },
        { href: '/dashboard/appointments',label: 'Termine',       icon: Calendar },
        { href: '/dashboard/team',        label: 'Team',          icon: Users },
      ],
    },
    {
      label: 'Verwaltung',
      items: [
        { href: '/dashboard/settings', label: 'Einstellungen', icon: Settings },
      ],
    },
  ],
  member: [
    {
      items: [
        { href: '/app',               label: 'Home',          icon: Home },
        { href: '/app/pitch-tracker', label: 'Meine Pitches', icon: Send },
        { href: '/app/crm',           label: 'CRM Board',     icon: KanbanSquare },
        { href: '/app/onboarding',    label: 'Onboarding',    icon: BookOpen },
        { href: '/app/checkin',       label: 'Check-In',      icon: CalendarCheck },
        { href: '/app/followups', label: 'Follow-Ups', icon: RotateCcw, locked: true },
        { href: '/app/calendar',  label: 'Kalender',   icon: Calendar,  locked: true },
      ],
    },
  ],
};

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  role:        UserRole;
  isCollapsed: boolean;
  onToggle:    () => void;
}

const MotionNav  = motion(Box);
const MotionSpan = motion.span;

export function Sidebar({ role, isCollapsed, onToggle }: Props) {
  const pathname   = usePathname();
  const sections   = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.member;
  const sidebarW   = isCollapsed ? 64 : 240;

  function isActive(href: string) {
    if (href === '/admin' || href === '/dashboard' || href === '/app') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <MotionNav
      as="nav"
      position="fixed"
      left={0}
      top="var(--banner-height, 0px)"
      h="calc(100vh - var(--banner-height, 0px))"
      bg="surface"
      borderRight="1px solid"
      borderColor="app-border"
      display="flex"
      flexDir="column"
      zIndex={20}
      overflow="hidden"
      animate={{ width: sidebarW }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Logo / Brand */}
      <Box
        h="64px"
        px={isCollapsed ? 0 : '12px'}
        display="flex"
        alignItems="center"
        justifyContent={isCollapsed ? 'center' : 'flex-start'}
        borderBottom="1px solid"
        borderColor="app-border"
        flexShrink={0}
      >
        <Box
          w="28px"
          h="28px"
          borderRadius="var(--radius-2)"
          overflow="hidden"
          flexShrink={0}
        >
          <Image
            src="/logo-tj-white.png"
            alt="T&J"
            width={28}
            height={28}
            style={{ objectFit: 'contain', width: '100%', height: '100%' }}
          />
        </Box>
        <AnimatePresence>
          {!isCollapsed && (
            <MotionSpan
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                marginLeft: '10px',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--ink)',
                letterSpacing: '-0.01em',
              }}
            >
              T&J CRM
            </MotionSpan>
          )}
        </AnimatePresence>
      </Box>

      {/* Nav Sections */}
      <Box flex={1} overflowY="auto" py="8px" px="8px">
        {sections.map((section, si) => (
          <Box key={si} mb={2}>
            {/* Section label — hidden when collapsed */}
            <AnimatePresence>
              {section.label && !isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Text
                    fontFamily="var(--font-mono)"
                    fontSize="10px"
                    fontWeight={500}
                    letterSpacing="0.10em"
                    textTransform="uppercase"
                    color="app-border"
                    px="12px"
                    pt="12px"
                    pb="4px"
                  >
                    {section.label}
                  </Text>
                </motion.div>
              )}
            </AnimatePresence>

            {section.items.map(item => (
              <NavItemRow
                key={item.href}
                item={item}
                active={isActive(item.href)}
                collapsed={isCollapsed}
              />
            ))}
          </Box>
        ))}
      </Box>

      {/* Collapse Toggle */}
      <Box
        borderTop="1px solid"
        borderColor="app-border"
        p="8px"
        flexShrink={0}
      >
        <Box
          as="button"
          onClick={onToggle}
          display="flex"
          alignItems="center"
          justifyContent={isCollapsed ? 'center' : 'flex-start'}
          w="100%"
          h="36px"
          px={isCollapsed ? 0 : '12px'}
          borderRadius="var(--radius-3)"
          color="app-text-muted"
          bg="transparent"
          cursor="pointer"
          border="none"
          transition="all 120ms"
          _hover={{ bg: 'var(--ink-04)', color: 'app-text' }}
          aria-label={isCollapsed ? 'Sidebar ausklappen' : 'Sidebar einklappen'}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </motion.div>
        </Box>
      </Box>
    </MotionNav>
  );
}

// ─── Single Nav Item ─────────────────────────────────────────────────────────

function NavItemRow({
  item,
  active,
  collapsed,
}: {
  item:      NavItem;
  active:    boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  if (item.locked) {
    const lockedInner = (
      <Box
        display="flex"
        alignItems="center"
        justifyContent={collapsed ? 'center' : 'flex-start'}
        gap="10px"
        h="40px"
        px={collapsed ? 0 : '12px'}
        borderRadius="var(--radius-3)"
        color="var(--mist)"
        bg="transparent"
        fontFamily="var(--font-sans)"
        fontSize="14px"
        fontWeight={400}
        cursor="not-allowed"
        mb="2px"
        flexShrink={0}
        userSelect="none"
        opacity={0.6}
        position="relative"
      >
        <Icon size={18} strokeWidth={1.5} style={{ flexShrink: 0 }} />

        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.18 }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Lock badge */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                background: 'var(--mist)',
                flexShrink: 0,
              }}
            >
              <Lock size={9} strokeWidth={2} color="var(--mute)" />
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    );

    return (
      <Tooltip label={`${item.label} — bald verfügbar`} placement="right">
        {lockedInner}
      </Tooltip>
    );
  }

  const inner = (
    <Box
      as={Link}
      href={item.href}
      display="flex"
      alignItems="center"
      justifyContent={collapsed ? 'center' : 'flex-start'}
      gap="10px"
      h="40px"
      px={collapsed ? 0 : '12px'}
      borderRadius="var(--radius-3)"
      color={active ? 'var(--paper)' : 'var(--mute)'}
      bg={active ? 'var(--forest)' : 'transparent'}
      fontFamily="var(--font-sans)"
      fontSize="14px"
      fontWeight={active ? 500 : 400}
      textDecoration="none"
      transition="all 120ms var(--ease-default)"
      _hover={
        active
          ? { bg: 'var(--glow)' }
          : { bg: 'var(--ink-04)', color: 'var(--ink)' }
      }
      mb="2px"
      flexShrink={0}
    >
      <Icon size={18} strokeWidth={1.5} style={{ flexShrink: 0 }} />

      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Box>
  );

  if (collapsed) {
    return (
      <Tooltip label={item.label} placement="right">
        {inner}
      </Tooltip>
    );
  }

  return inner;
}
