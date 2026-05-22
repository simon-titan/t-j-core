'use client';

import { useState } from 'react';
import { Box, HStack, Input, Text, Spinner } from '@chakra-ui/react';
import { Plus, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { addDays } from './types';
import type { PitchWithRelations } from './types';
import { t } from '@/lib/toast';

interface Props {
  templateId: string | null; // null = "no-template"
  orgId:      string;
  userId:     string;
  onCreated:  (pitch: PitchWithRelations) => void;
}

interface FormState {
  firstName:   string;
  lastName:    string;
  linkedinUrl: string;
  notes:       string;
}

const EMPTY: FormState = { firstName: '', lastName: '', linkedinUrl: '', notes: '' };

const inputStyles = {
  bg:           'transparent',
  border:       '1px solid transparent',
  borderRadius: 'var(--radius-2)',
  fontFamily:   'var(--font-sans)',
  fontSize:     '13px',
  h:            '32px',
  px:           '8px',
  color:        'var(--ink)',
  _placeholder: { color: 'rgba(74,124,92,0.5)' },
  _focus: {
    bg:          'var(--paper)',
    borderColor: 'var(--leaf)',
    boxShadow:   '0 0 0 2px rgba(74,124,92,0.15)',
    outline:     'none',
  },
  _hover: {
    bg:          'rgba(255,255,255,0.5)',
    borderColor: 'rgba(74,124,92,0.3)',
  },
};

export function StickyAddRow({ templateId, orgId, userId, onCreated }: Props) {
  const [form, setForm]       = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const supabase = createClient();

  async function handleSubmit() {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.linkedinUrl.trim()) {
      setError('Vorname, Nachname und LinkedIn URL sind erforderlich.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // 1. Upsert prospect
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: prospectData, error: prospectErr } = await (supabase.from('prospects') as any)
        .upsert(
          {
            organization_id: orgId,
            first_name:      form.firstName.trim(),
            last_name:       form.lastName.trim(),
            linkedin_url:    form.linkedinUrl.trim(),
            created_by:      userId,
          },
          { onConflict: 'linkedin_url', ignoreDuplicates: false }
        )
        .select('id, first_name, last_name, linkedin_url, company')
        .single();

      if (prospectErr || !prospectData) throw prospectErr ?? new Error('Prospect konnte nicht angelegt werden.');

      // 2. Create pitch
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: pitchData, error: pitchErr } = await (supabase.from('pitches') as any)
        .insert({
          organization_id: orgId,
          prospect_id:     prospectData.id,
          template_id:     templateId,
          sent_by:         userId,
          status:          'sent',
          sent_at:         new Date().toISOString(),
          notes:           form.notes.trim() || null,
        })
        .select('id, organization_id, prospect_id, template_id, sent_by, status, sent_at, answered_at, notes, created_at, updated_at')
        .single();

      if (pitchErr || !pitchData) throw pitchErr ?? new Error('Pitch konnte nicht angelegt werden.');

      // 3. Create 3 follow-up slots
      const today = new Date();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('followups') as any).insert([
        { organization_id: orgId, pitch_id: pitchData.id, assigned_to: userId, level: 1, status: 'pending', scheduled_for: addDays(today, 3) },
        { organization_id: orgId, pitch_id: pitchData.id, assigned_to: userId, level: 2, status: 'pending', scheduled_for: addDays(today, 7) },
        { organization_id: orgId, pitch_id: pitchData.id, assigned_to: userId, level: 3, status: 'pending', scheduled_for: addDays(today, 14) },
      ]);

      const newPitch: PitchWithRelations = {
        ...pitchData,
        prospects:       prospectData,
        pitch_templates: null,
        followups:       [],
        leads:           [],
        sender:          null,
      };

      setForm(EMPTY);
      onCreated(newPitch);
      t.success('Pitch erstellt');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fehler beim Erstellen.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <Box
      borderLeft="4px solid var(--forest)"
      bg="rgba(74,124,92,0.04)"
      borderRadius="0 var(--radius-3) var(--radius-3) 0"
      border="1px solid rgba(74,124,92,0.18)"
      borderLeftWidth="4px"
      mb={0}
      borderBottom="1px solid var(--mist)"
    >
      {/* Label strip */}
      <Box px={3} pt={2} pb={1}>
        <HStack spacing={1}>
          <Plus size={11} strokeWidth={3} color="var(--forest)" />
          <Text
            fontFamily="var(--font-mono)"
            fontSize="9px"
            letterSpacing="0.12em"
            textTransform="uppercase"
            color="var(--forest)"
            fontWeight={600}
          >
            Schnell hinzufügen
          </Text>
        </HStack>
      </Box>

      {/* Input Row */}
      <HStack px={3} pb={2} spacing={2} align="center">
        <Input
          {...inputStyles}
          placeholder="Vorname *"
          value={form.firstName}
          onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
          onKeyDown={handleKeyDown}
          flex="1"
          minW="90px"
        />
        <Input
          {...inputStyles}
          placeholder="Nachname *"
          value={form.lastName}
          onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
          onKeyDown={handleKeyDown}
          flex="1"
          minW="90px"
        />
        <Input
          {...inputStyles}
          placeholder="LinkedIn URL *"
          value={form.linkedinUrl}
          onChange={e => setForm(f => ({ ...f, linkedinUrl: e.target.value }))}
          onKeyDown={handleKeyDown}
          flex="2"
          minW="160px"
        />
        <Input
          {...inputStyles}
          placeholder="Notizen"
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          onKeyDown={handleKeyDown}
          flex="2"
          minW="120px"
        />

        {/* Submit Button */}
        <Box
          as="button"
          onClick={handleSubmit}
          disabled={loading}
          display="flex"
          alignItems="center"
          gap="6px"
          px={3}
          h="32px"
          bg="var(--forest)"
          color="var(--paper)"
          borderRadius="var(--radius-2)"
          fontFamily="var(--font-sans)"
          fontSize="12px"
          fontWeight={600}
          letterSpacing="0.02em"
          flexShrink={0}
          cursor={loading ? 'not-allowed' : 'pointer'}
          opacity={loading ? 0.7 : 1}
          sx={{ transition: 'all 120ms var(--ease-default)' }}
          _hover={!loading ? { bg: 'var(--forest-deep)' } : {}}
        >
          {loading
            ? <Spinner size="xs" color="var(--paper)" />
            : <Plus size={13} strokeWidth={3} />
          }
          {!loading && 'Hinzufügen'}
        </Box>
      </HStack>

      {/* Error */}
      {error && (
        <HStack px={3} pb={2} spacing={1}>
          <AlertCircle size={12} color="#991B1B" />
          <Text fontFamily="var(--font-sans)" fontSize="12px" color="#991B1B">
            {error}
          </Text>
        </HStack>
      )}
    </Box>
  );
}
