'use client';

import { useState } from 'react';
import { Box, Text, VStack, Textarea, Button, HStack } from '@chakra-ui/react';
import { Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { KanbanLead } from './types';

interface Props {
  lead: KanbanLead;
  onUpdate: (fields: {
    pain_points: string | null;
    objections: string | null;
    notes: string | null;
  }) => void;
}

const textareaStyle = {
  bg: 'var(--frost)',
  border: '1px solid',
  borderColor: 'var(--mist)',
  borderRadius: 'var(--radius-2)',
  fontFamily: 'var(--font-sans)',
  fontSize: '14px',
  color: 'var(--ink)',
  resize: 'none' as const,
  _placeholder: { color: 'var(--mute)', opacity: 0.65 },
  _hover: { borderColor: 'var(--mute)' },
  _focus: {
    borderColor: 'var(--leaf)',
    boxShadow: '0 0 0 3px rgba(74,124,92,0.12)',
    outline: 'none',
  },
};

export function QualificationNotes({ lead, onUpdate }: Props) {
  const supabase = createClient();
  const [painPoints, setPainPoints] = useState(lead.pain_points ?? '');
  const [objections, setObjections] = useState(lead.objections ?? '');
  const [notes, setNotes] = useState(lead.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isDirty =
    painPoints !== (lead.pain_points ?? '') ||
    objections !== (lead.objections ?? '') ||
    notes !== (lead.notes ?? '');

  async function handleSave() {
    setSaving(true);
    await (supabase.from('leads') as any)
      .update({
        pain_points: painPoints.trim() || null,
        objections: objections.trim() || null,
        notes: notes.trim() || null,
      })
      .eq('id', lead.id);

    onUpdate({
      pain_points: painPoints.trim() || null,
      objections: objections.trim() || null,
      notes: notes.trim() || null,
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <VStack align="stretch" spacing="var(--space-5)">
      {/* Pain Points */}
      <Box>
        <Text
          fontFamily="var(--font-sans)"
          fontSize="13px"
          fontWeight={500}
          color="var(--ink)"
          mb="var(--space-2)"
        >
          Pain Points
        </Text>
        <Textarea
          value={painPoints}
          onChange={(e) => setPainPoints(e.target.value)}
          placeholder="Welche Probleme hat der Lead?"
          rows={3}
          {...textareaStyle}
        />
      </Box>

      {/* Objections */}
      <Box>
        <Text
          fontFamily="var(--font-sans)"
          fontSize="13px"
          fontWeight={500}
          color="var(--ink)"
          mb="var(--space-2)"
        >
          Einwände
        </Text>
        <Textarea
          value={objections}
          onChange={(e) => setObjections(e.target.value)}
          placeholder="Welche Einwände wurden geäußert?"
          rows={3}
          {...textareaStyle}
        />
      </Box>

      {/* General Notes */}
      <Box>
        <Text
          fontFamily="var(--font-sans)"
          fontSize="13px"
          fontWeight={500}
          color="var(--ink)"
          mb="var(--space-2)"
        >
          Allgemeine Notizen
        </Text>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Sonstige Informationen..."
          rows={4}
          {...textareaStyle}
        />
      </Box>

      {/* Save Button */}
      <HStack justify="flex-end">
        <Button
          leftIcon={<Save size={14} strokeWidth={1.5} />}
          onClick={handleSave}
          isLoading={saving}
          isDisabled={!isDirty}
          bg={saved ? 'rgba(74,124,92,0.12)' : isDirty ? 'var(--ink)' : 'var(--frost)'}
          color={saved ? 'var(--forest)' : isDirty ? 'var(--paper)' : 'var(--mute)'}
          border={saved ? '1px solid rgba(74,124,92,0.25)' : 'none'}
          fontFamily="var(--font-sans)"
          fontSize="13px"
          fontWeight={500}
          borderRadius="var(--radius-2)"
          h="34px"
          px="var(--space-5)"
          _hover={{ bg: isDirty && !saved ? 'var(--forest-deep)' : undefined }}
          _active={{ transform: 'scale(0.97)' }}
          transition="all 200ms ease"
          cursor={isDirty ? 'pointer' : 'not-allowed'}
        >
          {saved ? 'Gespeichert ✓' : 'Speichern'}
        </Button>
      </HStack>
    </VStack>
  );
}
