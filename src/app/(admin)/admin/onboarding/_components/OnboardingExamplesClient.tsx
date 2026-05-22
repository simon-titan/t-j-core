'use client';

import { useState } from 'react';
import { Box, Text, VStack, HStack, Textarea } from '@chakra-ui/react';
import { Trash2, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { OnboardingExample } from '@/lib/types/database';

interface Props {
  initialExamples: OnboardingExample[];
}

export function OnboardingExamplesClient({ initialExamples }: Props) {
  const supabase = createClient();

  const [examples, setExamples] = useState<OnboardingExample[]>(initialExamples);
  const [title,   setTitle]   = useState('');
  const [content, setContent] = useState('');
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const canAdd = title.trim().length > 0 && content.trim().length > 0 && !saving;

  async function handleAdd() {
    if (!canAdd) return;
    setSaving(true);
    setError('');

    const nextIndex = examples.length > 0
      ? Math.max(...examples.map((e) => e.order_index)) + 1
      : 0;

    const { data, error: err } = await supabase
      .from('onboarding_examples')
      .insert({
        module_slug: 'direct-pitch',
        title:       title.trim(),
        content:     content.trim(),
        order_index: nextIndex,
      })
      .select()
      .single();

    if (err || !data) {
      setError(err?.message ?? 'Skript konnte nicht gespeichert werden.');
      setSaving(false);
      return;
    }

    setExamples((prev) => [...prev, data as OnboardingExample]);
    setTitle('');
    setContent('');
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const { error: err } = await supabase
      .from('onboarding_examples')
      .delete()
      .eq('id', id);

    if (err) {
      setError(err.message);
      return;
    }

    setExamples((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <Box maxW="var(--admin-max-width)" mx="auto">
      {/* Header */}
      <Box mb={8}>
        <span className="label-kicker" style={{ display: 'block', marginBottom: 'var(--space-3)' }}>
          Onboarding
        </span>
        <Text
          fontFamily="var(--font-sans)"
          fontSize="24px"
          fontWeight={600}
          letterSpacing="-0.02em"
          color="var(--ink)"
        >
          Beispielskripte — Direct Pitch
        </Text>
        <Text fontFamily="var(--font-sans)" fontSize="14px" color="var(--mute)" mt={1}>
          Diese Skripte erscheinen für alle Kunden am Ende des Workbooks „Baue deinen Direct Pitch".
        </Text>
      </Box>

      {/* Add form */}
      <Box
        bg="var(--paper)"
        border="1px solid var(--mist)"
        borderRadius="var(--radius-3)"
        p={6}
        mb={8}
      >
        <Text
          fontFamily="var(--font-mono)"
          fontSize="11px"
          fontWeight={500}
          letterSpacing="0.08em"
          textTransform="uppercase"
          color="var(--mute)"
          mb={4}
        >
          Neues Skript hinzufügen
        </Text>

        <VStack align="stretch" spacing={4}>
          <Box>
            <label style={labelStyle}>Skript-Name *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. Tom – LinkedIn Skript"
              style={inputStyle}
            />
          </Box>

          <Box>
            <label style={labelStyle}>Skripttext *</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Vollständiges Pitch-Skript hier einfügen…"
              rows={10}
              fontFamily="var(--font-sans)"
              fontSize="14px"
              color="var(--ink)"
              bg="var(--paper)"
              border="1px solid var(--mist)"
              borderRadius="var(--radius-2)"
              p="10px 14px"
              resize="vertical"
              _focus={{ outline: 'none', borderColor: 'var(--forest)', boxShadow: 'none' }}
              _placeholder={{ color: 'var(--mute)' }}
            />
          </Box>

          {error && (
            <Text
              fontFamily="var(--font-sans)"
              fontSize="13px"
              color="#991B1B"
              bg="rgba(239,68,68,0.08)"
              border="1px solid rgba(239,68,68,0.18)"
              borderRadius="var(--radius-2)"
              px={3}
              py={2}
            >
              {error}
            </Text>
          )}

          <Box>
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              style={{
                display:        'inline-flex',
                alignItems:     'center',
                gap:            '6px',
                height:         '40px',
                padding:        '0 20px',
                background:     canAdd ? 'var(--forest)' : '#C8D5CB',
                color:          'var(--paper)',
                fontFamily:     'var(--font-sans)',
                fontWeight:     500,
                fontSize:       '14px',
                letterSpacing:  '-0.01em',
                borderRadius:   'var(--radius-2)',
                border:         'none',
                cursor:         canAdd ? 'pointer' : 'not-allowed',
                transition:     'background 150ms ease',
              }}
            >
              <Plus size={15} strokeWidth={1.8} />
              {saving ? 'Wird gespeichert…' : 'Skript speichern'}
            </button>
          </Box>
        </VStack>
      </Box>

      {/* Existing scripts */}
      {examples.length === 0 ? (
        <Box
          border="1px dashed var(--mist)"
          borderRadius="var(--radius-3)"
          p={8}
          textAlign="center"
        >
          <Text fontFamily="var(--font-sans)" fontSize="14px" color="var(--mute)">
            Noch keine Skripte vorhanden.
          </Text>
        </Box>
      ) : (
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between" mb={1}>
            <Text
              fontFamily="var(--font-mono)"
              fontSize="11px"
              fontWeight={500}
              letterSpacing="0.08em"
              textTransform="uppercase"
              color="var(--mute)"
            >
              Gespeicherte Skripte
            </Text>
            <Text fontFamily="var(--font-mono)" fontSize="11px" color="var(--mute)">
              {examples.length} {examples.length === 1 ? 'Skript' : 'Skripte'}
            </Text>
          </HStack>

          {examples.map((ex) => (
            <Box
              key={ex.id}
              bg="var(--paper)"
              border="1px solid var(--mist)"
              borderRadius="var(--radius-3)"
              p={5}
            >
              <HStack justify="space-between" align="flex-start" mb={3}>
                <Text
                  fontFamily="var(--font-sans)"
                  fontSize="15px"
                  fontWeight={600}
                  letterSpacing="-0.01em"
                  color="var(--ink)"
                >
                  {ex.title ?? 'Ohne Titel'}
                </Text>
                <Box
                  as="button"
                  onClick={() => handleDelete(ex.id)}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  w="32px"
                  h="32px"
                  borderRadius="var(--radius-2)"
                  bg="transparent"
                  border="1px solid var(--mist)"
                  color="var(--mute)"
                  cursor="pointer"
                  flexShrink={0}
                  transition="all 120ms"
                  _hover={{ bg: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.30)', color: '#DC2626' }}
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </Box>
              </HStack>
              <Text
                fontFamily="var(--font-sans)"
                fontSize="13px"
                color="var(--ink)"
                lineHeight={1.7}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {ex.content}
              </Text>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}

const labelStyle: React.CSSProperties = {
  display:       'block',
  fontFamily:    'var(--font-sans)',
  fontSize:      '13px',
  fontWeight:    500,
  color:         'var(--mute)',
  marginBottom:  '6px',
  letterSpacing: '-0.01em',
};

const inputStyle: React.CSSProperties = {
  width:        '100%',
  height:       '44px',
  padding:      '0 14px',
  fontFamily:   'var(--font-sans)',
  fontSize:     '14px',
  color:        'var(--ink)',
  background:   'var(--paper)',
  border:       '1px solid var(--mist)',
  borderRadius: 'var(--radius-2)',
  outline:      'none',
  boxSizing:    'border-box',
  transition:   'border-color 150ms ease',
};
