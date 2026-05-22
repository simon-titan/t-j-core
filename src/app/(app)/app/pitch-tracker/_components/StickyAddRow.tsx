'use client';

import { useState } from 'react';
import { Box, HStack, Input, Text, Spinner } from '@chakra-ui/react';
import { Plus, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { addDays } from './types';
import type { PitchWithRelations } from './types';
import { t } from '@/lib/toast';

interface Props {
  templateId: string | null;
  orgId:      string;
  userId:     string;
  onCreated:  (pitch: PitchWithRelations) => void;
}

interface FormState {
  name:        string;
  linkedinUrl: string;
  notes:       string;
}

const EMPTY: FormState = { name: '', linkedinUrl: '', notes: '' };

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
    if (!form.name.trim()) {
      setError('Name ist erforderlich.');
      return;
    }
    setError(null);
    setLoading(true);

    const nameParts  = form.name.trim().split(/\s+/);
    const first_name = nameParts[0] ?? '';
    const last_name  = nameParts.slice(1).join(' ');
    const linkedinUrl = form.linkedinUrl.trim();

    try {
      let prospectData: { id: string; first_name: string; last_name: string; linkedin_url: string | null; company: string | null } | null = null;

      if (linkedinUrl) {
        // Upsert by linkedin_url to avoid duplicates
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error: err } = await (supabase.from('prospects') as any)
          .upsert(
            { organization_id: orgId, first_name, last_name, linkedin_url: linkedinUrl, created_by: userId },
            { onConflict: 'linkedin_url', ignoreDuplicates: false }
          )
          .select('id, first_name, last_name, linkedin_url, company')
          .single();
        if (err || !data) throw err ?? new Error('Prospect konnte nicht angelegt werden.');
        prospectData = data;
      } else {
        // No LinkedIn URL — plain insert
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error: err } = await (supabase.from('prospects') as any)
          .insert({ organization_id: orgId, first_name, last_name, linkedin_url: null, created_by: userId })
          .select('id, first_name, last_name, linkedin_url, company')
          .single();
        if (err || !data) throw err ?? new Error('Prospect konnte nicht angelegt werden.');
        prospectData = data;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: pitchData, error: pitchErr } = await (supabase.from('pitches') as any)
        .insert({
          organization_id: orgId,
          prospect_id:     prospectData!.id,
          template_id:     templateId,
          sent_by:         userId,
          status:          'sent',
          sent_at:         new Date().toISOString(),
          notes:           form.notes.trim() || null,
        })
        .select('id, organization_id, prospect_id, template_id, sent_by, status, sent_at, answered_at, notes, created_at, updated_at')
        .single();

      if (pitchErr || !pitchData) throw pitchErr ?? new Error('Pitch konnte nicht angelegt werden.');

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
          placeholder="Vollständiger Name *"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          onKeyDown={handleKeyDown}
          flex="2"
          minW="140px"
        />
        <Input
          {...inputStyles}
          placeholder="LinkedIn URL (optional)"
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
