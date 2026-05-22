'use client';

import { useState, useEffect } from 'react';
import { Box, useBreakpointValue } from '@chakra-ui/react';
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
  const [isCollapsed, setIsCollapsed]     = useState(false);
  const [isMobileOpen, setIsMobileOpen]   = useState(false);
  const [mounted, setMounted]             = useState(false);

  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === 'true') setIsCollapsed(true);
    setMounted(true);
  }, []);

  const sidebarWidth = isCollapsed ? 64 : 240;

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--current-sidebar-width',
      isMobile ? '0px' : `${sidebarWidth}px`,
    );
  }, [sidebarWidth, isMobile]);

  useEffect(() => {
    document.documentElement.style.setProperty('--banner-height', `${BANNER_HEIGHT}px`);
    document.documentElement.style.setProperty('--nav-height', `${BANNER_HEIGHT + 64}px`);
  }, []);

  useEffect(() => {
    if (!isMobile) setIsMobileOpen(false);
  }, [isMobile]);

  function handleToggle() {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }

  if (!mounted) return null;

  return (
    <Box display="flex" minH="100vh" bg="app-bg" pt={`${BANNER_HEIGHT}px`}>
      <BetaBanner />

      {/* Mobile backdrop */}
      {isMobile && isMobileOpen && (
        <Box
          position="fixed"
          inset={0}
          bg="rgba(0,0,0,0.45)"
          zIndex={19}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <Sidebar
        role={role}
        isCollapsed={isMobile ? false : isCollapsed}
        onToggle={handleToggle}
        isMobile={isMobile}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <Box
        flex={1}
        display="flex"
        flexDir="column"
        minH={`calc(100vh - ${BANNER_HEIGHT}px)`}
        ml={isMobile ? 0 : `${sidebarWidth}px`}
        transition="margin-left 0.25s cubic-bezier(0.4,0,0.2,1)"
      >
        <Topbar
          orgName={orgName}
          orgLogoUrl={orgLogoUrl}
          userId={userId}
          fullName={fullName}
          role={role}
          sidebarWidth={isMobile ? 0 : sidebarWidth}
          onMobileMenuOpen={() => setIsMobileOpen(true)}
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
