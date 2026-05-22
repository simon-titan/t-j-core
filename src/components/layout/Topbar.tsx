'use client';

import Image from 'next/image';
import { Box, HStack, Text, IconButton, Tooltip, useColorMode } from '@chakra-ui/react';
import { Moon, Sun, Menu as MenuIcon } from 'lucide-react';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { UserMenu } from '@/components/ui/UserMenu';

interface Props {
  orgName:            string;
  orgLogoUrl?:        string | null;
  userId:             string;
  fullName:           string | null;
  role:               string;
  sidebarWidth:       number;
  onMobileMenuOpen:   () => void;
}

export function Topbar({ orgName, orgLogoUrl, userId, fullName, role, onMobileMenuOpen }: Props) {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box
      as="header"
      position="sticky"
      top="var(--banner-height, 0px)"
      zIndex={20}
      h="64px"
      bg="topbar-bg"
      backdropFilter="blur(16px) saturate(1.4)"
      borderBottom="1px solid"
      borderColor="app-border"
      px="24px"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      flexShrink={0}
    >
      {/* Left: Hamburger (mobile only) + T&J branding × Org branding */}
      <HStack spacing={0} gap="8px" align="center" minW={0} overflow="hidden">
        {/* Hamburger — visible only on mobile */}
        <IconButton
          aria-label="Navigation öffnen"
          variant="icon"
          display={{ base: 'flex', md: 'none' }}
          onClick={onMobileMenuOpen}
          icon={<MenuIcon size={20} strokeWidth={1.5} />}
          flexShrink={0}
          mr="4px"
        />

        {/* T&J Logo */}
        <Box
          borderRadius="4px"
          overflow="hidden"
          flexShrink={0}
          w="28px"
          h="28px"
          position="relative"
        >
          <Image
            src="/logo-tj.jpg"
            alt="T&J"
            width={28}
            height={28}
            style={{ objectFit: 'contain', width: '100%', height: '100%' }}
          />
        </Box>

        {/* T&J label */}
        <Text
          fontFamily="var(--font-sans)"
          fontSize="13px"
          fontWeight={600}
          color="app-text"
          letterSpacing="-0.01em"
          flexShrink={0}
          noOfLines={1}
          display={{ base: 'none', sm: 'block' }}
        >
          T&J Consulting
        </Text>

        {/* Separator */}
        <Text
          fontFamily="var(--font-sans)"
          fontSize="14px"
          fontWeight={300}
          color="app-text-muted"
          userSelect="none"
          flexShrink={0}
          opacity={0.5}
          mx="2px"
          display={{ base: 'none', sm: 'block' }}
        >
          ×
        </Text>

        {/* Org Logo (optional) */}
        {orgLogoUrl && (
          <Box
            borderRadius="4px"
            overflow="hidden"
            flexShrink={0}
            w="24px"
            h="24px"
            position="relative"
          >
            <Image
              src={orgLogoUrl}
              alt={orgName}
              width={24}
              height={24}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </Box>
        )}

        {/* Org Name */}
        <Text
          fontFamily="var(--font-sans)"
          fontSize="13px"
          fontWeight={500}
          color="app-text-muted"
          letterSpacing="-0.01em"
          noOfLines={1}
          minW={0}
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {orgName}
        </Text>
      </HStack>

      {/* Right: Controls */}
      <HStack spacing={2} flexShrink={0}>
        <Tooltip label={colorMode === 'light' ? 'Dark Mode' : 'Light Mode'} placement="bottom">
          <IconButton
            aria-label="Farbmodus wechseln"
            variant="icon"
            onClick={toggleColorMode}
            icon={
              colorMode === 'light'
                ? <Moon size={18} strokeWidth={1.5} />
                : <Sun size={18} strokeWidth={1.5} />
            }
          />
        </Tooltip>

        <NotificationBell userId={userId} />

        <UserMenu fullName={fullName} role={role} />
      </HStack>
    </Box>
  );
}
