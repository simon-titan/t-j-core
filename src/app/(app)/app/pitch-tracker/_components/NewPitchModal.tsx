'use client';

import { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton,
  VStack, HStack, FormControl, FormLabel, Input,
  Textarea, Select, Button, Text,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { TemplateOption } from './types';
import { addDays } from './types';

const MotionModalContent = motion(ModalContent);

interface Props {
  isOpen:       boolean;
  onClose:      () => void;
  templates:    TemplateOption[];
  userId:       string;
  orgId:        string;
  onCreated:    () => void;
}

interface FormState {
  firstName:   string;
  lastName:    string;
  linkedinUrl: string;
  templateId:  string;
  message:     string;
  notes:       string;
}

const EMPTY: FormState = {
  firstName:   '',
  lastName:    '',
  linkedinUrl: '',
  templateId:  '',
  message:     '',
  notes:       '',
};

const inputStyles = {
  bg:          'var(--frost)',
  border:      '1px solid var(--mist)',
  borderRadius:'var(--radius-2)',
  fontFamily:  'var(--font-sans)',
  fontSize:    '14px',
  color:       'var(--ink)',
  _placeholder:{ color: 'var(--mute)' },
  _focus:      { borderColor: 'var(--leaf)', boxShadow: '0 0 0 3px rgba(74,124,92,0.12)', bg: 'var(--paper)' },
};

const labelStyles = {
  fontFamily:    'var(--font-mono)',
  fontSize:      '10px',
  letterSpacing: '0.10em',
  textTransform: 'uppercase' as const,
  color:         'var(--mute)',
  mb:            1,
};

export function NewPitchModal({ isOpen, onClose, templates, userId, orgId, onCreated }: Props) {
  const [form, setForm]       = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const supabase = createClient();

  function handleTemplateChange(id: string) {
    const tpl = templates.find(t => t.id === id);
    setForm(f => ({ ...f, templateId: id, message: tpl?.body ?? f.message }));
  }

  async function handleSubmit() {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.linkedinUrl.trim()) {
      setError('Vorname, Nachname und LinkedIn URL sind erforderlich.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // 1. Upsert prospect by linkedin_url
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: prospectData, error: prospectErr } = await (supabase
        .from('prospects') as any)
        .upsert(
          {
            organization_id: orgId,
            first_name:      form.firstName.trim(),
            last_name:       form.lastName.trim(),
            linkedin_url:    form.linkedinUrl.trim(),
          },
          { onConflict: 'linkedin_url', ignoreDuplicates: false }
        )
        .select('id')
        .single();

      if (prospectErr || !prospectData) throw prospectErr ?? new Error('Prospect konnte nicht angelegt werden.');

      // 2. Create pitch
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: pitchData, error: pitchErr } = await (supabase
        .from('pitches') as any)
        .insert({
          organization_id: orgId,
          prospect_id:     prospectData.id,
          template_id:     form.templateId || null,
          sent_by:         userId,
          status:          'sent',
          sent_at:         new Date().toISOString(),
          notes:           form.notes.trim() || null,
        })
        .select('id')
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

      setForm(EMPTY);
      onClose();
      onCreated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler.');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setForm(EMPTY);
    setError(null);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
      <ModalOverlay bg="rgba(14,14,12,0.65)" backdropFilter="blur(4px)" />
      <MotionModalContent
        initial={{ scale: 0.96, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 8 }}
        transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] } as never}
        bg="var(--paper)"
        border="1px solid var(--mist)"
        borderRadius="var(--radius-5)"
        boxShadow="var(--shadow-cool-4)"
        maxW="520px"
        mx={4}
      >
        <ModalHeader
          fontFamily="var(--font-display)"
          fontStyle="italic"
          fontSize="28px"
          letterSpacing="-0.02em"
          color="var(--ink)"
          pt={6}
          pb={1}
        >
          Neuer Pitch.
        </ModalHeader>
        <ModalCloseButton
          color="var(--mute)"
          top={5}
          right={5}
          _hover={{ color: 'var(--ink)', bg: 'var(--ink-04)' }}
        />

        <ModalBody pt={4} pb={2}>
          <VStack spacing={4} align="stretch">
            {/* Name row */}
            <HStack spacing={3}>
              <FormControl isRequired>
                <FormLabel {...labelStyles}>Vorname</FormLabel>
                <Input
                  {...inputStyles}
                  value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  placeholder="Anna"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel {...labelStyles}>Nachname</FormLabel>
                <Input
                  {...inputStyles}
                  value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  placeholder="Schmidt"
                />
              </FormControl>
            </HStack>

            {/* LinkedIn URL */}
            <FormControl isRequired>
              <FormLabel {...labelStyles}>LinkedIn URL</FormLabel>
              <Input
                {...inputStyles}
                type="url"
                value={form.linkedinUrl}
                onChange={e => setForm(f => ({ ...f, linkedinUrl: e.target.value }))}
                placeholder="https://linkedin.com/in/anna-schmidt"
              />
            </FormControl>

            {/* Template */}
            <FormControl>
              <FormLabel {...labelStyles}>Pitch Template</FormLabel>
              <Select
                {...inputStyles}
                h="40px"
                value={form.templateId}
                onChange={e => handleTemplateChange(e.target.value)}
                placeholder="Kein Template"
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </FormControl>

            {/* Message */}
            <FormControl>
              <FormLabel {...labelStyles}>Nachricht</FormLabel>
              <Textarea
                {...inputStyles}
                rows={5}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Deine LinkedIn-Nachricht…"
                resize="vertical"
              />
            </FormControl>

            {/* Notes */}
            <FormControl>
              <FormLabel {...labelStyles}>Notizen (optional)</FormLabel>
              <Textarea
                {...inputStyles}
                rows={3}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Interne Notizen…"
                resize="vertical"
              />
            </FormControl>

            {error && (
              <Text
                fontFamily="var(--font-sans)"
                fontSize="13px"
                color="#991B1B"
                bg="rgba(153,27,27,0.06)"
                border="1px solid rgba(153,27,27,0.15)"
                borderRadius="var(--radius-2)"
                px={3}
                py={2}
              >
                {error}
              </Text>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter gap={2} pb={5} pt={3}>
          <Button
            variant="ghost"
            fontFamily="var(--font-sans)"
            fontSize="14px"
            color="var(--mute)"
            _hover={{ color: 'var(--ink)', bg: 'var(--ink-04)' }}
            onClick={handleClose}
            isDisabled={loading}
          >
            Abbrechen
          </Button>
          <Button
            fontFamily="var(--font-sans)"
            fontSize="14px"
            fontWeight={500}
            bg="var(--ink)"
            color="var(--paper)"
            px={5}
            _hover={{ bg: 'var(--forest-deep)' }}
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Erstellen…"
          >
            Pitch erstellen
          </Button>
        </ModalFooter>
      </MotionModalContent>
    </Modal>
  );
}
