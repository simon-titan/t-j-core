'use client';

import { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BetaBanner } from '@/components/ui/BetaBanner';
import type { UserRole } from '@/lib/types/database';

const BANNER_HEIGHT = 36;

const SIDEBAR_STORAGE_KEY = 'tj-crm-sidebar-collapsed';

interface Props {
  role:        UserRole;
  orgName:     string;
  orgLogoUrl?: string | null;
  userId:      string;
  fullName:    string | null;
  children:    React.ReactNode;
}

export function AppShell({ role, orgName, orgLogoUrl, userId, fullName, children }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted]         = useState(false);

  // Read persisted state after mount (avoid SSR mismatch)
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === 'true') setIsCollapsed(true);
    setMounted(true);
  }, []);

  const sidebarWidth = isCollapsed ? 64 : 240;

  // Expose layout dimensions as CSS variables for fixed-position children
  useEffect(() => {
    document.documentElement.style.setProperty('--current-sidebar-width', `${sidebarWidth}px`);
  }, [sidebarWidth]);

  useEffect(() => {
    document.documentElement.style.setProperty('--banner-height', `${BANNER_HEIGHT}px`);
    document.documentElement.style.setProperty('--nav-height', `${BANNER_HEIGHT + 64}px`);
  }, []);

  function handleToggle() {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }

  // Avoid layout flash before localStorage is read
  if (!mounted) return null;

  return (
    <Box display="flex" minH="100vh" bg="app-bg" pt={`${BANNER_HEIGHT}px`}>
      <BetaBanner />
      <Sidebar
        role={role}
        isCollapsed={isCollapsed}
        onToggle={handleToggle}
      />

      {/* Main content area — shifts right as sidebar expands */}
      <Box
        flex={1}
        display="flex"
        flexDir="column"
        minH={`calc(100vh - ${BANNER_HEIGHT}px)`}
        ml={`${sidebarWidth}px`}
        transition="margin-left 0.25s cubic-bezier(0.4,0,0.2,1)"
      >
        <Topbar
          orgName={orgName}
          orgLogoUrl={orgLogoUrl}
          userId={userId}
          fullName={fullName}
          role={role}
          sidebarWidth={sidebarWidth}
        />

        <Box
          as="main"
          flex={1}
          p={{ base: '20px', md: '32px' }}
          maxW="1280px"
          w="100%"
          mx="auto"
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
