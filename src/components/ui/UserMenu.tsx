'use client';

import { useRouter } from 'next/navigation';
import {
  Menu, MenuButton, MenuList, MenuItem, MenuDivider,
  Box, Text,
} from '@chakra-ui/react';
import { Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Props {
  fullName: string | null;
  role:     string;
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export function UserMenu({ fullName, role }: Props) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const roleLabel: Record<string, string> = {
    super_admin: 'Super Admin',
    org_admin:   'Admin',
    member:      'Mitglied',
  };

  return (
    <Menu placement="bottom-end">
      <MenuButton aria-label="Benutzermenu">
        <Box
          w="32px"
          h="32px"
          borderRadius="var(--radius-full)"
          bg="var(--forest)"
          color="var(--paper)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="12px"
          fontWeight={600}
          fontFamily="var(--font-sans)"
          cursor="pointer"
          transition="opacity 120ms"
          _hover={{ opacity: 0.85 }}
          flexShrink={0}
        >
          {getInitials(fullName)}
        </Box>
      </MenuButton>

      <MenuList>
        {/* User info header */}
        <Box px={3} py={2} mb={1}>
          <Text fontSize="13px" fontWeight={500} color="app-text" lineHeight={1.3}>
            {fullName ?? 'Unbekannt'}
          </Text>
          <Text fontSize="11px" color="app-text-muted" mt="2px">
            {roleLabel[role] ?? role}
          </Text>
        </Box>

        <MenuDivider />

        <MenuItem
          as={Link}
          href="/app/account"
          icon={<Settings size={14} strokeWidth={1.5} />}
          fontSize="14px"
        >
          Einstellungen
        </MenuItem>

        <MenuDivider />

        <MenuItem
          icon={<LogOut size={14} strokeWidth={1.5} />}
          fontSize="14px"
          color="#991B1B"
          _hover={{ bg: 'rgba(239,68,68,0.06)', color: '#991B1B' }}
          onClick={handleSignOut}
        >
          Abmelden
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
