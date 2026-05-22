'use client';

import { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton,
  VStack, SimpleGrid, FormControl, FormLabel, Input, Textarea, Button, Text,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { t } from '@/lib/toast';
import type { KanbanLead, KanbanProspect } from './types';
import { deriveKanbanColumn, calcDaysSinceLastContact } from './types';

const MotionModalContent = motion(ModalContent);

interface Props {
  isOpen:    boolean;
  onClose:   () => void;
  userId:    string;
  orgId:     string;
  onCreated: (lead: KanbanLead) => void;
}

interface FormState {
  name:     string;
  company:  string;
  position: string;
  email:    string;
  phone:    string;
  notes:    string;
}

const EMPTY: FormState = { name: '', company: '', position: '', email: '', phone: '', notes: '' };

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

export function NewLeadModal({ isOpen, onClose, userId, orgId, onCreated }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  function handleClose() {
    setForm(EMPTY);
    setError(null);
    onClose();
  }

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

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: prospectData, error: prospectErr } = await (supabase.from('prospects') as any)
        .insert({
          organization_id: orgId,
          created_by:      userId,
          first_name,
          last_name,
          company:  form.company.trim() || null,
          position: form.position.trim() || null,
          email:    form.email.trim() || null,
          phone:    form.phone.trim() || null,
        })
        .select('id, first_name, last_name, company, position, email, phone, linkedin_url, website, industry, company_size')
        .single();
      if (prospectErr || !prospectData) throw prospectErr ?? new Error('Kontakt konnte nicht angelegt werden.');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: leadData, error: leadErr } = await (supabase.from('leads') as any)
        .insert({
          organization_id: orgId,
          prospect_id:     prospectData.id,
          pitch_id:        null,
          assigned_to:     userId,
          status:          'contacted',
          notes:           form.notes.trim() || null,
        })
        .select('id, status, meeting_system, pain_points, objections, notes, created_at, updated_at, assigned_to, organization_id, prospect_id')
        .single();
      if (leadErr || !leadData) throw leadErr ?? new Error('Lead konnte nicht angelegt werden.');

      const lead: KanbanLead = {
        id:                   leadData.id,
        status:               leadData.status,
        meeting_system:       leadData.meeting_system ?? null,
        pain_points:          leadData.pain_points ?? null,
        objections:           leadData.objections ?? null,
        notes:                leadData.notes ?? null,
        created_at:           leadData.created_at,
        updated_at:           leadData.updated_at,
        assigned_to:          leadData.assigned_to ?? null,
        organization_id:      leadData.organization_id,
        prospect_id:          leadData.prospect_id,
        prospect:             prospectData as KanbanProspect,
        appointments:         [],
        deals:                [],
        column:               deriveKanbanColumn(leadData.status, []),
        daysSinceLastContact: calcDaysSinceLastContact([], leadData.created_at),
        nextAppointment:      null,
        latestMeetingType:    null,
      };

      t.success('Lead angelegt');
      onCreated(lead);
      setForm(EMPTY);
      onClose();
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
        maxW="560px"
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
          Neuer Lead.
        </ModalHeader>
        <ModalCloseButton color="var(--mute)" top={5} right={5} _hover={{ color: 'var(--ink)' }} />

        <ModalBody pt={4} pb={2}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel {...labelStyles}>Name</FormLabel>
              <Input
                {...inputStyles}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Anna Schmidt"
                autoFocus
              />
            </FormControl>

            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <FormControl>
                <FormLabel {...labelStyles}>Firma</FormLabel>
                <Input {...inputStyles} value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Acme GmbH" />
              </FormControl>
              <FormControl>
                <FormLabel {...labelStyles}>Position</FormLabel>
                <Input {...inputStyles} value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} placeholder="Geschäftsführerin" />
              </FormControl>
              <FormControl>
                <FormLabel {...labelStyles}>E-Mail</FormLabel>
                <Input {...inputStyles} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="anna@acme.de" />
              </FormControl>
              <FormControl>
                <FormLabel {...labelStyles}>Telefon</FormLabel>
                <Input {...inputStyles} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+49 …" />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel {...labelStyles}>Notiz (optional)</FormLabel>
              <Textarea
                {...inputStyles}
                rows={3}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Kontext zum Lead…"
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
            _hover={{ color: 'var(--ink)' }}
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
            Lead erstellen
          </Button>
        </ModalFooter>
      </MotionModalContent>
    </Modal>
  );
}
