import { Metadata } from 'next';
import { Box, Text } from '@chakra-ui/react';
import { Building2, Users, Send, BarChart2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { AdminMetricsTable } from './_components/AdminMetricsTable';
import type { OrgMetricRow } from './_components/AdminMetricsTable';

export const metadata: Metadata = { title: 'Admin — Übersicht' };

export default async function AdminPage() {
  const supabase = createClient();

  const [orgsRes, profilesRes, pitchesRes, dealsRes, apptsRes] = await Promise.all([
    supabase.from('organizations').select('id, name, logo_url, is_active').order('created_at'),
    supabase.from('profiles').select('id, organization_id'),
    supabase.from('pitches').select('organization_id, status'),
    supabase.from('deals').select('organization_id'),
    supabase.from('appointments').select('assigned_to, status').in('status', ['scheduled', 'completed']),
  ]);

  const orgs     = orgsRes.data     ?? [];
  const profiles = profilesRes.data ?? [];
  const pitches  = pitchesRes.data  ?? [];
  const deals    = dealsRes.data    ?? [];
  const appts    = apptsRes.data    ?? [];

  // Build member-id → org-id lookup for appointment aggregation
  const memberOrgMap: Record<string, string> = {};
  for (const p of profiles) {
    if (p.organization_id) memberOrgMap[p.id] = p.organization_id;
  }

  // ── Aggregate per org ──────────────────────────────────────
  const rows: OrgMetricRow[] = orgs.map(org => ({
    id:                org.id,
    name:              org.name,
    logo_url:          org.logo_url,
    is_active:         org.is_active,
    member_count:      profiles.filter(p => p.organization_id === org.id).length,
    dm_count:          pitches.filter(p  => p.organization_id === org.id).length,
    answer_count:      pitches.filter(p  => p.organization_id === org.id && p.status === 'answered').length,
    deal_count:        deals.filter(d    => d.organization_id === org.id).length,
    appointment_count: appts.filter(a    => a.assigned_to && memberOrgMap[a.assigned_to] === org.id).length,
  }));

  // ── Global stats ───────────────────────────────────────────
  const totalOrgs    = orgs.length;
  const totalUsers   = profiles.length;
  const totalDMs     = pitches.length;
  const totalAnswers = pitches.filter(p => p.status === 'answered').length;
  const avgAnswer    = totalDMs > 0 ? Math.round((totalAnswers / totalDMs) * 100) : 0;

  const stats = [
    { label: 'Organisationen', value: totalOrgs,    icon: Building2 },
    { label: 'Benutzer',       value: totalUsers,   icon: Users     },
    { label: 'Gesamt-DMs',     value: totalDMs.toLocaleString('de-DE'), icon: Send },
    { label: 'Ø Antwortrate',  value: `${avgAnswer}%`, icon: BarChart2 },
  ];

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
          System-Übersicht
        </h1>
      </Box>

      {/* Stat cards */}
      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }}
        gap={4}
        mb={8}
      >
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <Box
              key={s.label}
              bg="var(--ink)"
              borderRadius="var(--radius-3)"
              p={5}
              display="flex"
              flexDir="column"
              gap={3}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Text
                  fontFamily="var(--font-mono)"
                  fontSize="10px"
                  fontWeight={500}
                  letterSpacing="0.10em"
                  textTransform="uppercase"
                  color="rgba(252,252,253,0.45)"
                >
                  {s.label}
                </Text>
                <Icon size={14} strokeWidth={1.5} color="rgba(252,252,253,0.30)" />
              </Box>
              <Text
                fontFamily="var(--font-sans)"
                fontSize="28px"
                fontWeight={600}
                letterSpacing="-0.03em"
                color="var(--paper)"
                lineHeight={1}
              >
                {s.value}
              </Text>
            </Box>
          );
        })}
      </Box>

      {/* Org metrics table */}
      <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
        <Text
          fontFamily="var(--font-mono)"
          fontSize="11px"
          fontWeight={500}
          letterSpacing="0.08em"
          textTransform="uppercase"
          color="var(--mute)"
        >
          Alle Organisationen
        </Text>
        <Text
          fontFamily="var(--font-mono)"
          fontSize="11px"
          color="var(--mute)"
        >
          {rows.length} {rows.length === 1 ? 'Eintrag' : 'Einträge'}
        </Text>
      </Box>

      <AdminMetricsTable rows={rows} />
    </Box>
  );
}
