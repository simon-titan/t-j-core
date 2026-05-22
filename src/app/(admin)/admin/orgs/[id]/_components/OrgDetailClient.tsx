'use client';

import { useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { UsersTab }        from './UsersTab';
import { VisibilityTab }   from './VisibilityTab';
import { TemplatesTab }    from './TemplatesTab';
import { OrgAnalyticsTab } from './OrgAnalyticsTab';
import { LogoTab }         from './LogoTab';
import type { Organization, Profile, PitchTemplate, VisibilityMatrix } from '@/lib/types/database';

interface ProfileWithEmail extends Profile {
  email: string | null;
}

interface Props {
  org:       Organization;
  members:   ProfileWithEmail[];
  templates: PitchTemplate[];
  matrix:    VisibilityMatrix[];
  userId:    string;
}

const TABS = ['Benutzer', 'Sichtbarkeit', 'Templates', 'Auswertung', 'Logo'] as const;
type Tab = typeof TABS[number];

export function OrgDetailClient({ org, members, templates, matrix, userId }: Props) {
  const [active, setActive] = useState<Tab>('Benutzer');

  return (
    <Box maxW="var(--admin-max-width)" mx="auto">
      {/* Breadcrumb */}
      <Box
        as={Link}
        href="/admin/orgs"
        display="inline-flex"
        alignItems="center"
        gap={1}
        mb={6}
        fontFamily="var(--font-sans)"
        fontSize="13px"
        color="var(--mute)"
        textDecoration="none"
        transition="color 120ms"
        _hover={{ color: 'var(--ink)' }}
      >
        <ChevronLeft size={14} strokeWidth={1.5} />
        Organisationen
      </Box>

      {/* Org header */}
      <Box display="flex" alignItems="center" gap={4} mb={8}>
        <Box
          w="52px"
          h="52px"
          borderRadius="var(--radius-2)"
          bg="var(--forest)"
          flexShrink={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          {org.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={org.logo_url}
              alt={org.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Text
              fontFamily="var(--font-mono)"
              fontSize="16px"
              fontWeight={700}
              color="var(--paper)"
            >
              {org.name.slice(0, 2).toUpperCase()}
            </Text>
          )}
        </Box>

        <Box flex={1}>
          <Box display="flex" alignItems="center" gap={3} mb={1}>
            <h1
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '22px',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              {org.name}
            </h1>
            <Box
              as="span"
              display="inline-flex"
              alignItems="center"
              px="8px"
              py="2px"
              borderRadius="var(--radius-full)"
              border="1px solid"
              fontSize="10px"
              fontFamily="var(--font-sans)"
              fontWeight={500}
              letterSpacing="0.04em"
              bg={org.is_active ? 'rgba(74,124,92,0.10)' : 'rgba(239,68,68,0.07)'}
              borderColor={org.is_active ? 'rgba(74,124,92,0.25)' : 'rgba(239,68,68,0.18)'}
              color={org.is_active ? 'var(--forest)' : '#991B1B'}
            >
              {org.is_active ? 'Aktiv' : 'Inaktiv'}
            </Box>
          </Box>
          <Text
            fontFamily="var(--font-mono)"
            fontSize="12px"
            color="var(--mute)"
          >
            {members.length} Benutzer · {templates.length} Templates
          </Text>
        </Box>
      </Box>

      {/* Divider */}
      <Box h="1px" bg="var(--mist)" mb={0} />

      {/* Tab bar */}
      <Box display="flex" gap={0} mb={6} borderBottom="1px solid var(--mist)">
        {TABS.map(tab => (
          <Box
            key={tab}
            as="button"
            onClick={() => setActive(tab)}
            px={5}
            py={3}
            fontFamily="var(--font-sans)"
            fontSize="13px"
            fontWeight={active === tab ? 600 : 400}
            color={active === tab ? 'var(--ink)' : 'var(--mute)'}
            bg="transparent"
            border="none"
            cursor="pointer"
            borderBottom={active === tab ? '2px solid var(--ink)' : '2px solid transparent'}
            mb="-1px"
            transition="all 120ms"
            _hover={{ color: 'var(--ink)' }}
          >
            {tab}
          </Box>
        ))}
      </Box>

      {/* Tab content */}
      {active === 'Benutzer'    && <UsersTab        orgId={org.id} members={members} />}
      {active === 'Sichtbarkeit' && <VisibilityTab orgId={org.id} members={members} matrix={matrix} />}
      {active === 'Templates'   && <TemplatesTab   orgId={org.id} userId={userId} templates={templates} />}
      {active === 'Auswertung'  && <OrgAnalyticsTab orgId={org.id} members={members} />}
      {active === 'Logo'        && <LogoTab org={org} />}
    </Box>
  );
}
