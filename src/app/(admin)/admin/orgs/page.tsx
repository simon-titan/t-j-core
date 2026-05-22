import { Metadata } from 'next';
import { Box, Text } from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/server';
import { OrgListClient } from './_components/OrgListClient';
import type { Organization } from '@/lib/types/database';

export const metadata: Metadata = { title: 'Admin — Organisationen' };

export default async function AdminOrgsPage() {
  const supabase = createClient();

  const [orgsRes, profilesRes] = await Promise.all([
    supabase.from('organizations').select('*').order('created_at'),
    supabase.from('profiles').select('organization_id'),
  ]);

  const orgs     = (orgsRes.data     ?? []) as Organization[];
  const profiles = profilesRes.data  ?? [];

  const orgsWithCount = orgs.map(org => ({
    ...org,
    member_count: profiles.filter(p => p.organization_id === org.id).length,
  }));

  return (
    <Box maxW="var(--admin-max-width)" mx="auto">
      {/* Header */}
      <Box mb={8}>
        <span
          className="label-kicker"
          style={{ display: 'block', marginBottom: 'var(--space-3)' }}
        >
          Super Admin
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '24px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            margin: 0,
          }}
        >
          Organisationen
        </h1>
        <Text
          fontFamily="var(--font-sans)"
          fontSize="14px"
          color="var(--mute)"
          mt={2}
        >
          Alle Mandanten verwalten — erstellen, konfigurieren, deaktivieren.
        </Text>
      </Box>

      {/* Divider */}
      <Box h="1px" bg="var(--mist)" mb={6} />

      <OrgListClient orgs={orgsWithCount} />
    </Box>
  );
}
