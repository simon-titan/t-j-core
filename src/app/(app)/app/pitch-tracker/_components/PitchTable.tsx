'use client';

import { useState } from 'react';
import {
  Box, Text, VStack, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  Button, Input, useDisclosure,
} from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/client';
import type { PitchWithRelations } from './types';
import { PitchRow } from './PitchRow';
import { t } from '@/lib/toast';

interface Props {
  pitches:         PitchWithRelations[];
  onStatusChange:  (id: string, newStatus: 'answered' | 'sent') => void;
  onLeadCreated:   (prospectName: string | null) => void;
  onDelete:        (id: string) => void;
  onNotesUpdated:  (id: string, notes: string | null) => void;
  onAppointmentCreated: (pitchId: string, leadId: string, appt: { id: string; scheduled_at: string; status: string }) => void;
  userId:          string;
  orgId:           string;
  showSentBy?:     boolean;
}

const COL_HEADERS_TEMPLATE = [
  { label: 'Datum',      w: '80px',          hideOnMobile: true  },
  { label: 'Name',       w: '1fr',           hideOnMobile: false },
  { label: 'Template',   w: '120px',         hideOnMobile: true  },
  { label: 'Follow-Up',  w: '80px',          hideOnMobile: true  },
  { label: 'Geantw.',    w: '100px',         hideOnMobile: false },
  { label: 'Termin',     w: '90px',          hideOnMobile: true  },
  { label: 'Notizen',    w: 'minmax(0,1fr)', hideOnMobile: true  },
  { label: '',           w: '40px',          hideOnMobile: false },
];

const COL_HEADERS_SENTBY = [
  { label: 'Datum',      w: '80px',          hideOnMobile: true  },
  { label: 'Name',       w: '1fr',           hideOnMobile: false },
  { label: 'Von',        w: '120px',         hideOnMobile: true  },
  { label: 'Follow-Up',  w: '80px',          hideOnMobile: true  },
  { label: 'Geantw.',    w: '100px',         hideOnMobile: false },
  { label: 'Termin',     w: '90px',          hideOnMobile: true  },
  { label: 'Notizen',    w: 'minmax(0,1fr)', hideOnMobile: true  },
  { label: '',           w: '40px',          hideOnMobile: false },
];

interface ApptTarget {
  pitchId:        string;
  prospectName:   string;
  existingLeadId: string | null;
  prospectId:     string;
}

export function PitchTable({
  pitches,
  onStatusChange,
  onLeadCreated,
  onDelete,
  onNotesUpdated,
  onAppointmentCreated,
  userId,
  orgId,
  showSentBy,
}: Props) {
  const COL_HEADERS    = showSentBy ? COL_HEADERS_SENTBY : COL_HEADERS_TEMPLATE;
  const gridTemplateMd = COL_HEADERS.map(c => c.w).join(' ');
  const gridTemplateSm = COL_HEADERS.filter(c => !c.hideOnMobile).map(c => c.w).join(' ');

  const [updating, setUpdating]         = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [apptTarget, setApptTarget]     = useState<ApptTarget | null>(null);
  const [apptDate, setApptDate]         = useState('');
  const [savingAppt, setSavingAppt]     = useState(false);

  const { isOpen: isDeleteOpen, onOpen: openDelete, onClose: closeDelete } = useDisclosure();
  const { isOpen: isApptOpen,   onOpen: openAppt,   onClose: closeAppt   } = useDisclosure();

  const supabase = createClient();

  async function handleAnswer(id: string, checked: boolean) {
    setUpdating(id);
    const newStatus = checked ? 'answered' : 'sent';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('pitches') as any).update({
      status:      newStatus,
      answered_at: checked ? new Date().toISOString() : null,
    }).eq('id', id);
    if (error) {
      t.error('Status konnte nicht aktualisiert werden');
    } else {
      onStatusChange(id, newStatus);
      if (checked) {
        const pitch = pitches.find(p => p.id === id);
        const name  = pitch?.prospects
          ? `${pitch.prospects.first_name} ${pitch.prospects.last_name}`
          : null;
        onLeadCreated(name);
        t.success('Pitch als beantwortet markiert');
      } else {
        t.info('Status zurückgesetzt');
      }
    }
    setUpdating(null);
  }

  function handleScheduleAppointment(pitchId: string) {
    const pitch = pitches.find(p => p.id === pitchId);
    if (!pitch) return;
    const name = pitch.prospects
      ? `${pitch.prospects.first_name} ${pitch.prospects.last_name}`.trim()
      : 'Termin';
    setApptTarget({
      pitchId,
      prospectName:   name,
      existingLeadId: pitch.leads?.[0]?.id ?? null,
      prospectId:     pitch.prospect_id,
    });
    // Default to tomorrow at 10:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setApptDate(tomorrow.toISOString().slice(0, 16));
    openAppt();
  }

  async function saveAppointment() {
    if (!apptTarget || !apptDate) return;
    setSavingAppt(true);
    try {
      let leadId = apptTarget.existingLeadId;

      if (!leadId) {
        // Auto-create a lead
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: leadData, error: leadErr } = await (supabase.from('leads') as any)
          .insert({
            organization_id: orgId,
            prospect_id:     apptTarget.prospectId,
            pitch_id:        apptTarget.pitchId,
            assigned_to:     userId,
            status:          'contacted',
          })
          .select('id')
          .single();
        if (leadErr || !leadData) throw leadErr ?? new Error('Lead konnte nicht angelegt werden.');
        leadId = leadData.id;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: apptData, error: apptErr } = await (supabase.from('appointments') as any)
        .insert({
          organization_id:  orgId,
          lead_id:          leadId,
          created_by:       userId,
          assigned_to:      userId,
          title:            `Termin mit ${apptTarget.prospectName}`,
          scheduled_at:     new Date(apptDate).toISOString(),
          duration_minutes: 60,
          status:           'scheduled',
        })
        .select('id, scheduled_at, status')
        .single();

      if (apptErr || !apptData) throw apptErr ?? new Error('Termin konnte nicht angelegt werden.');

      t.success('Termin eingetragen');
      onAppointmentCreated(apptTarget.pitchId, leadId!, apptData);
      closeAppt();
      setApptTarget(null);
      setApptDate('');
    } catch (err) {
      t.error(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setSavingAppt(false);
    }
  }

  function handleDelete(id: string) {
    setDeleteTarget(id);
    openDelete();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const { error } = await supabase.from('pitches').delete().eq('id', deleteTarget);
    if (error) {
      t.error('Pitch konnte nicht gelöscht werden');
    } else {
      onDelete(deleteTarget);
    }
    closeDelete();
    setDeleteTarget(null);
  }

  if (pitches.length === 0) {
    return (
      <Box py={16} textAlign="center">
        <Text
          fontFamily="var(--font-display)"
          fontStyle="italic"
          fontSize="24px"
          color="var(--mute)"
          letterSpacing="-0.01em"
        >
          Noch keine Pitches.
        </Text>
        <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--mute)" mt={2}>
          Nutze die Eingabezeile oben um den ersten Pitch hinzuzufügen.
        </Text>
      </Box>
    );
  }

  return (
    <>
      <Box
        border="1px solid var(--mist)"
        borderRadius="var(--radius-4)"
        overflow="hidden"
      >
        {/* Header Row */}
        <Box
          display="grid"
          gridTemplateColumns={{ base: gridTemplateSm, md: gridTemplateMd }}
          alignItems="center"
          px={3}
          h="40px"
          bg="var(--frost)"
          borderBottom="1px solid var(--mist)"
        >
          {COL_HEADERS.map(col => (
            <Text
              key={col.label}
              fontFamily="var(--font-mono)"
              fontSize="10px"
              letterSpacing="0.10em"
              textTransform="uppercase"
              color="var(--mute)"
              display={{ base: col.hideOnMobile ? 'none' : 'block', md: 'block' }}
            >
              {col.label}
            </Text>
          ))}
        </Box>

        {/* Rows */}
        <VStack align="stretch" spacing={0}>
          {pitches.map(pitch => (
            <PitchRow
              key={pitch.id}
              pitch={pitch}
              onAnswer={handleAnswer}
              onDelete={handleDelete}
              onScheduleAppointment={handleScheduleAppointment}
              onNotesUpdated={onNotesUpdated}
              isUpdating={updating === pitch.id}
              showSentBy={showSentBy}
            />
          ))}
        </VStack>
      </Box>

      {/* Appointment Modal */}
      <Modal isOpen={isApptOpen} onClose={closeAppt} isCentered size="sm">
        <ModalOverlay bg="rgba(14,14,12,0.65)" backdropFilter="blur(4px)" />
        <ModalContent
          bg="var(--paper)"
          border="1px solid var(--mist)"
          borderRadius="var(--radius-5)"
          boxShadow="var(--shadow-cool-4)"
          fontFamily="var(--font-sans)"
        >
          <ModalHeader
            fontFamily="var(--font-display)"
            fontStyle="italic"
            fontSize="22px"
            letterSpacing="-0.02em"
            color="var(--ink)"
            pb={1}
          >
            Termin eintragen
          </ModalHeader>
          {apptTarget && (
            <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--mute)" px={6} pb={2}>
              {apptTarget.prospectName}
            </Text>
          )}
          <ModalCloseButton color="var(--mute)" />
          <ModalBody pb={4}>
            <Input
              type="datetime-local"
              value={apptDate}
              onChange={e => setApptDate(e.target.value)}
              fontFamily="var(--font-sans)"
              fontSize="14px"
              bg="var(--frost)"
              border="1px solid var(--mist)"
              borderRadius="var(--radius-2)"
              _focus={{ borderColor: 'var(--leaf)', boxShadow: '0 0 0 3px rgba(74,124,92,0.12)' }}
              color="var(--ink)"
            />
          </ModalBody>
          <ModalFooter gap={2}>
            <Button
              variant="ghost"
              size="sm"
              fontFamily="var(--font-sans)"
              color="var(--mute)"
              onClick={closeAppt}
              isDisabled={savingAppt}
            >
              Abbrechen
            </Button>
            <Button
              size="sm"
              fontFamily="var(--font-sans)"
              bg="var(--forest)"
              color="var(--paper)"
              _hover={{ bg: 'var(--forest-deep)' }}
              onClick={saveAppointment}
              isLoading={savingAppt}
              loadingText="Speichern…"
              isDisabled={!apptDate}
            >
              Termin speichern
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={closeDelete} isCentered size="sm">
        <ModalOverlay bg="rgba(14,14,12,0.65)" backdropFilter="blur(4px)" />
        <ModalContent
          bg="var(--paper)"
          border="1px solid var(--mist)"
          borderRadius="var(--radius-5)"
          boxShadow="var(--shadow-cool-4)"
          fontFamily="var(--font-sans)"
        >
          <ModalHeader
            fontFamily="var(--font-display)"
            fontStyle="italic"
            fontSize="22px"
            letterSpacing="-0.02em"
            color="var(--ink)"
            pb={2}
          >
            Pitch löschen?
          </ModalHeader>
          <ModalCloseButton color="var(--mute)" />
          <ModalBody pb={4}>
            <Text fontFamily="var(--font-sans)" fontSize="14px" color="var(--mute)">
              Dieser Pitch und alle zugehörigen Follow-Ups werden unwiderruflich gelöscht.
            </Text>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button
              variant="ghost"
              size="sm"
              fontFamily="var(--font-sans)"
              color="var(--mute)"
              onClick={closeDelete}
            >
              Abbrechen
            </Button>
            <Button
              size="sm"
              fontFamily="var(--font-sans)"
              bg="#991B1B"
              color="white"
              _hover={{ bg: '#7F1D1D' }}
              onClick={confirmDelete}
            >
              Löschen
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
