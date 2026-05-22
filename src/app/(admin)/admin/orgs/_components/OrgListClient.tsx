'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Plus, ChevronRight, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { CreateOrgModal } from './CreateOrgModal';
import type { Organization } from '@/lib/types/database';

interface OrgWithCount extends Organization {
  member_count: number;
}

interface Props {
  orgs: OrgWithCount[];
}

export function OrgListClient({ orgs: initialOrgs }: Props) {
  const router                    = useRouter();
  const [orgs,    setOrgs]        = useState(initialOrgs);
  const [modal,   setModal]       = useState(false);
  const [loading, setLoading]     = useState<string | null>(null);

  async function handleDeactivate(id: string, current: boolean) {
    setLoading(id);
    const supabase = createClient();
    await supabase
      .from('organizations')
      .update({ is_active: !current })
      .eq('id', id);
    setOrgs(prev => prev.map(o => o.id === id ? { ...o, is_active: !current } : o));
    setLoading(null);
  }

  return (
    <>
      {/* Top bar */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={6}>
        <Text
          fontFamily="var(--font-mono)"
          fontSize="11px"
          fontWeight={500}
          letterSpacing="0.08em"
          textTransform="uppercase"
          color="var(--mute)"
        >
          {orgs.length} {orgs.length === 1 ? 'Organisation' : 'Organisationen'}
        </Text>
        <motion.button
          onClick={() => setModal(true)}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            height: '36px',
            padding: '0 16px',
            borderRadius: 'var(--radius-2)',
            background: 'var(--ink)',
            color: 'var(--paper)',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Plus size={14} strokeWidth={2} />
          Neue Organisation
        </motion.button>
      </Box>

      {/* List */}
      <Box display="flex" flexDir="column" gap={3}>
        {orgs.length === 0 ? (
          <Box
            border="1px dashed var(--mist)"
            borderRadius="var(--radius-3)"
            py={12}
            textAlign="center"
          >
            <Text fontFamily="var(--font-sans)" fontSize="14px" color="var(--mute)">
              Noch keine Organisationen. Erstelle die erste.
            </Text>
          </Box>
        ) : (
          orgs.map(org => (
            <Box
              key={org.id}
              border="1px solid var(--mist)"
              borderRadius="var(--radius-3)"
              bg="var(--paper)"
              p={5}
              display="flex"
              alignItems="center"
              gap={4}
              transition="box-shadow 120ms, border-color 120ms"
              _hover={{ boxShadow: 'var(--shadow-2)', borderColor: 'rgba(14,14,12,0.12)' }}
            >
              {/* Logo */}
              <Box
                w="44px"
                h="44px"
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
                    fontSize="13px"
                    fontWeight={700}
                    color="var(--paper)"
                  >
                    {org.name.slice(0, 2).toUpperCase()}
                  </Text>
                )}
              </Box>

              {/* Info */}
              <Box flex={1} minW={0}>
                <Box display="flex" alignItems="center" gap={3} mb={1}>
                  <Text
                    fontFamily="var(--font-sans)"
                    fontSize="15px"
                    fontWeight={600}
                    color="var(--ink)"
                    letterSpacing="-0.01em"
                    isTruncated
                  >
                    {org.name}
                  </Text>
                  {/* Status badge */}
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
                    flexShrink={0}
                  >
                    {org.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Users size={12} strokeWidth={1.5} color="var(--mute)" />
                  <Text fontFamily="var(--font-mono)" fontSize="12px" color="var(--mute)">
                    {org.member_count} {org.member_count === 1 ? 'Benutzer' : 'Benutzer'}
                  </Text>
                </Box>
              </Box>

              {/* Actions */}
              <Box display="flex" alignItems="center" gap={2} flexShrink={0}>
                <Box
                  as="button"
                  onClick={() => handleDeactivate(org.id, org.is_active)}
                  disabled={loading === org.id}
                  h="32px"
                  px={3}
                  borderRadius="var(--radius-2)"
                  border="1px solid var(--mist)"
                  bg="transparent"
                  fontFamily="var(--font-sans)"
                  fontSize="12px"
                  fontWeight={500}
                  color={org.is_active ? '#991B1B' : 'var(--forest)'}
                  cursor="pointer"
                  transition="all 120ms"
                  opacity={loading === org.id ? 0.5 : 1}
                  _hover={{
                    bg: org.is_active ? 'rgba(239,68,68,0.06)' : 'rgba(74,124,92,0.08)',
                    borderColor: org.is_active ? 'rgba(239,68,68,0.30)' : 'rgba(74,124,92,0.30)',
                  }}
                >
                  {org.is_active ? 'Deaktivieren' : 'Aktivieren'}
                </Box>

                <Box
                  as="button"
                  onClick={() => router.push(`/admin/orgs/${org.id}`)}
                  display="inline-flex"
                  alignItems="center"
                  gap={1}
                  h="32px"
                  px={3}
                  borderRadius="var(--radius-2)"
                  bg="var(--ink)"
                  color="var(--paper)"
                  fontFamily="var(--font-sans)"
                  fontSize="12px"
                  fontWeight={500}
                  border="none"
                  cursor="pointer"
                  transition="all 120ms"
                  _hover={{ bg: 'var(--forest-deep)' }}
                >
                  Verwalten
                  <ChevronRight size={12} strokeWidth={2} />
                </Box>
              </Box>
            </Box>
          ))
        )}
      </Box>

      <CreateOrgModal
        isOpen={modal}
        onClose={() => setModal(false)}
        onCreated={() => router.refresh()}
      />
    </>
  );
}
