'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Text, Input, Select } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ExternalLink, X } from 'lucide-react';
import type { Profile, UserRole } from '@/lib/types/database';

interface ProfileWithEmail extends Profile {
  email: string | null;
}

interface Props {
  orgId:   string;
  members: ProfileWithEmail[];
}

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  org_admin:   'Org Admin',
  member:      'Mitglied',
};

const ROLE_COLORS: Record<UserRole, { bg: string; border: string; color: string }> = {
  super_admin: { bg: 'rgba(14,14,12,0.07)', border: 'rgba(14,14,12,0.15)', color: 'var(--ink)' },
  org_admin:   { bg: 'rgba(74,124,92,0.10)', border: 'rgba(74,124,92,0.25)', color: 'var(--forest)' },
  member:      { bg: 'var(--frost)', border: 'var(--mist)', color: 'var(--mute)' },
};

export function UsersTab({ orgId, members: initialMembers }: Props) {
  const router                    = useRouter();
  const [members, setMembers]     = useState(initialMembers);
  const [showForm, setShowForm]   = useState(false);
  const [email,    setEmail]      = useState('');
  const [role,     setRole]       = useState<'org_admin' | 'member'>('member');
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch('/api/admin/invite', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: email.trim(), role, organization_id: orgId }),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? 'Fehler beim Einladen.');
      setLoading(false);
      return;
    }

    setEmail('');
    setRole('member');
    setLoading(false);
    setShowForm(false);
    router.refresh();
  }

  async function handleRoleChange(userId: string, newRole: UserRole) {
    setRoleLoading(userId);
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    setMembers(prev => prev.map(m => m.id === userId ? { ...m, role: newRole } : m));
    setRoleLoading(null);
  }

  return (
    <Box>
      {/* Header row */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Text
          fontFamily="var(--font-mono)"
          fontSize="10px"
          fontWeight={500}
          letterSpacing="0.08em"
          textTransform="uppercase"
          color="var(--mute)"
        >
          {members.length} {members.length === 1 ? 'Benutzer' : 'Benutzer'}
        </Text>
        <motion.button
          onClick={() => setShowForm(v => !v)}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            height: '32px', padding: '0 12px',
            borderRadius: 'var(--radius-2)',
            background: showForm ? 'var(--frost)' : 'var(--ink)',
            color: showForm ? 'var(--ink)' : 'var(--paper)',
            fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500,
            border: showForm ? '1px solid var(--mist)' : 'none',
            cursor: 'pointer',
          }}
        >
          {showForm ? <X size={12} strokeWidth={2} /> : <Plus size={12} strokeWidth={2} />}
          {showForm ? 'Abbrechen' : 'User hinzufügen'}
        </motion.button>
      </Box>

      {/* Invite form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <Box
              as="form"
              onSubmit={handleInvite}
              border="1px solid var(--mist)"
              borderRadius="var(--radius-3)"
              p={4}
              mb={4}
              bg="var(--frost)"
              display="flex"
              gap={3}
              alignItems="flex-end"
            >
              <Box flex={1}>
                <Text
                  fontFamily="var(--font-sans)"
                  fontSize="12px"
                  fontWeight={500}
                  color="var(--ink)"
                  mb={1}
                >
                  E-Mail
                </Text>
                <Input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@firma.de"
                  type="email"
                  required
                  size="sm"
                  h="36px"
                  autoFocus
                />
              </Box>
              <Box w="140px">
                <Text
                  fontFamily="var(--font-sans)"
                  fontSize="12px"
                  fontWeight={500}
                  color="var(--ink)"
                  mb={1}
                >
                  Rolle
                </Text>
                <Select
                  value={role}
                  onChange={e => setRole(e.target.value as 'org_admin' | 'member')}
                  size="sm"
                  h="36px"
                  fontFamily="var(--font-sans)"
                  fontSize="13px"
                >
                  <option value="member">Mitglied</option>
                  <option value="org_admin">Org Admin</option>
                </Select>
              </Box>
              <Box
                as="button"
                type="submit"
                h="36px"
                px={4}
                borderRadius="var(--radius-2)"
                bg={loading ? 'var(--mute)' : 'var(--ink)'}
                color="var(--paper)"
                fontFamily="var(--font-sans)"
                fontSize="13px"
                fontWeight={500}
                border="none"
                cursor={loading ? 'wait' : 'pointer'}
                opacity={loading ? 0.65 : 1}
                flexShrink={0}
              >
                {loading ? 'Einladen…' : 'Einladen →'}
              </Box>
            </Box>
            {error && (
              <Text fontFamily="var(--font-sans)" fontSize="12px" color="#991B1B" mb={3} ml={1}>
                {error}
              </Text>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Members table */}
      <Box border="1px solid var(--mist)" borderRadius="var(--radius-3)" overflow="hidden" bg="var(--paper)">
        {/* Head */}
        <Box
          display="grid"
          gridTemplateColumns="1fr 200px 140px 80px"
          px={5}
          py={3}
          bg="var(--frost)"
          borderBottom="1px solid var(--mist)"
        >
          {['Name / E-Mail', 'E-Mail', 'Rolle', ''].map(h => (
            <Text
              key={h}
              fontFamily="var(--font-mono)"
              fontSize="10px"
              fontWeight={500}
              letterSpacing="0.08em"
              textTransform="uppercase"
              color="var(--mute)"
            >
              {h}
            </Text>
          ))}
        </Box>

        {members.length === 0 ? (
          <Box px={5} py={8} textAlign="center">
            <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--mute)">
              Noch keine Benutzer in dieser Organisation.
            </Text>
          </Box>
        ) : (
          members.map((m, i) => {
            const rc = ROLE_COLORS[m.role];
            return (
              <Box
                key={m.id}
                display="grid"
                gridTemplateColumns="1fr 200px 140px 80px"
                px={5}
                py={3}
                borderBottom={i < members.length - 1 ? '1px solid var(--mist)' : undefined}
                alignItems="center"
              >
                {/* Name */}
                <Text
                  fontFamily="var(--font-sans)"
                  fontSize="13px"
                  fontWeight={500}
                  color="var(--ink)"
                  isTruncated
                >
                  {m.full_name ?? '—'}
                </Text>

                {/* Email */}
                <Text
                  fontFamily="var(--font-mono)"
                  fontSize="12px"
                  color="var(--mute)"
                  isTruncated
                >
                  {m.email ?? '—'}
                </Text>

                {/* Role select */}
                <Box>
                  <Select
                    value={m.role}
                    onChange={e => handleRoleChange(m.id, e.target.value as UserRole)}
                    size="sm"
                    h="28px"
                    fontFamily="var(--font-sans)"
                    fontSize="12px"
                    bg={rc.bg}
                    borderColor={rc.border}
                    color={rc.color}
                    isDisabled={roleLoading === m.id || m.role === 'super_admin'}
                  >
                    <option value="member">Mitglied</option>
                    <option value="org_admin">Org Admin</option>
                    <option value="super_admin" disabled>Super Admin</option>
                  </Select>
                </Box>

                {/* Link to user preview */}
                <Box display="flex" justifyContent="flex-end">
                  <Box
                    as="button"
                    onClick={() => router.push(`/admin/orgs/${orgId}/users/${m.id}`)}
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    w="28px"
                    h="28px"
                    borderRadius="var(--radius-2)"
                    border="1px solid var(--mist)"
                    bg="transparent"
                    color="var(--mute)"
                    cursor="pointer"
                    transition="all 120ms"
                    _hover={{ color: 'var(--ink)', borderColor: 'var(--ink)', bg: 'var(--frost)' }}
                    title="Aktivität anzeigen"
                  >
                    <ExternalLink size={12} strokeWidth={1.5} />
                  </Box>
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
