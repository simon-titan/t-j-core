'use client';

import { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton,
  VStack, FormControl, FormLabel, Input, Textarea, Button, Text,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { TemplateWithStats } from './types';

const MotionModalContent = motion(ModalContent);

interface Props {
  isOpen:  boolean;
  onClose: () => void;
  orgId:   string;
  userId:  string;
  onCreated: (t: TemplateWithStats) => void;
}

interface FormState {
  name:            string;
  body:            string;
  target_audience: string;
  product_service: string;
}

const EMPTY: FormState = { name: '', body: '', target_audience: '', product_service: '' };

const inputStyles = {
  bg:           'var(--frost)',
  border:       '1px solid var(--mist)',
  borderRadius: 'var(--radius-2)',
  fontFamily:   'var(--font-sans)',
  fontSize:     '14px',
  color:        'var(--ink)',
  _placeholder: { color: 'var(--mute)' },
  _focus:       { borderColor: 'var(--leaf)', boxShadow: '0 0 0 3px rgba(74,124,92,0.12)', bg: 'var(--paper)' },
};

const labelStyles = {
  fontFamily:    'var(--font-mono)',
  fontSize:      '10px',
  letterSpacing: '0.10em',
  textTransform: 'uppercase' as const,
  color:         'var(--mute)',
  mb:            1,
};

export function CreateTemplateModal({ isOpen, onClose, orgId, userId, onCreated }: Props) {
  const [form, setForm]       = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  function handleClose() {
    setForm(EMPTY);
    setError(null);
    onClose();
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.body.trim()) {
      setError('Name und Nachricht sind Pflichtfelder.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: err } = await (supabase.from('pitch_templates') as any)
        .insert({
          organization_id:  orgId,
          created_by:       userId,
          name:             form.name.trim(),
          body:             form.body.trim(),
          target_audience:  form.target_audience.trim() || null,
          product_service:  form.product_service.trim() || null,
          is_active:        true,
        })
        .select()
        .single();

      if (err) throw err;

      onCreated({ ...data, pitches: [] } as TemplateWithStats);
      handleClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler.');
    } finally {
      setLoading(false);
    }
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
          Neue Variante.
        </ModalHeader>
        <ModalCloseButton
          color="var(--mute)"
          top={5}
          right={5}
          _hover={{ color: 'var(--ink)', bg: 'var(--ink-04)' }}
        />

        <ModalBody pt={4} pb={2}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel {...labelStyles}>Name</FormLabel>
              <Input
                {...inputStyles}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="z.B. Kalt-Akquise B2B"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelStyles}>Nachricht / Body</FormLabel>
              <Textarea
                {...inputStyles}
                rows={6}
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Deine LinkedIn-Nachrichtenvorlage…"
                resize="vertical"
              />
            </FormControl>

            <FormControl>
              <FormLabel {...labelStyles}>Zielgruppe (optional)</FormLabel>
              <Input
                {...inputStyles}
                value={form.target_audience}
                onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))}
                placeholder="z.B. Geschäftsführer im Mittelstand"
              />
            </FormControl>

            <FormControl>
              <FormLabel {...labelStyles}>Produkt / Service (optional)</FormLabel>
              <Input
                {...inputStyles}
                value={form.product_service}
                onChange={e => setForm(f => ({ ...f, product_service: e.target.value }))}
                placeholder="z.B. CRM-Beratung"
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
            Variante erstellen
          </Button>
        </ModalFooter>
      </MotionModalContent>
    </Modal>
  );
}
