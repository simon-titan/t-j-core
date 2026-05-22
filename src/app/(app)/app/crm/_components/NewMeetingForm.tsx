'use client';

import { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  Textarea,
  Select,
} from '@chakra-ui/react';
import { Plus, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { KanbanLead, KanbanAppointment, MeetingType } from './types';
import { MEETING_TYPE_LABELS, OUTCOME_LABELS, RESCHEDULE_REASONS } from './types';
import type { MeetingOutcomeType } from './types';

interface Props {
  lead: KanbanLead;
  isNeuTerminieren?: boolean;
  onCreated: (appointment: KanbanAppointment) => void;
}

const inputStyle = {
  bg: 'var(--frost)',
  border: '1px solid',
  borderColor: 'var(--mist)',
  borderRadius: 'var(--radius-2)',
  fontFamily: 'var(--font-sans)',
  fontSize: '14px',
  color: 'var(--ink)',
  _placeholder: { color: 'var(--mute)', opacity: 0.65 },
  _hover: { borderColor: 'var(--mute)' },
  _focus: {
    borderColor: 'var(--leaf)',
    boxShadow: '0 0 0 3px rgba(74,124,92,0.12)',
  },
};

export function NewMeetingForm({ lead, isNeuTerminieren = false, onCreated }: Props) {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState('60');
  const [location, setLocation] = useState('');
  const [meetingType, setMeetingType] = useState<MeetingType>('discovery');
  const [outcome, setOutcome] = useState<MeetingOutcomeType | ''>('');
  const [summary, setSummary] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  async function handleSubmit() {
    if (!title.trim() || !scheduledAt) return;
    if (isNeuTerminieren && !rescheduleReason) return;

    setLoading(true);

    const { data: apptData, error } = await (supabase.from('appointments') as any)
      .insert({
        lead_id: lead.id,
        organization_id: lead.organization_id,
        created_by: lead.assigned_to ?? '',
        assigned_to: lead.assigned_to,
        title: title.trim(),
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_minutes: parseInt(duration) || 60,
        location: location.trim() || null,
        status: 'scheduled',
        meeting_type: meetingType,
        notes: isNeuTerminieren ? `Neuterminierung: ${rescheduleReason}` : null,
      })
      .select('*, meeting_outcomes(*)')
      .single() as { data: any; error: any };

    if (!error && apptData && outcome) {
      await (supabase.from('meeting_outcomes') as any).insert({
        appointment_id: apptData.id,
        organization_id: lead.organization_id,
        recorded_by: lead.assigned_to ?? '',
        outcome,
        summary: summary.trim() || null,
        next_steps: nextSteps.trim() || null,
      });
    }

    if (!error && apptData) {
      const newAppt: KanbanAppointment = {
        ...apptData,
        meeting_type: meetingType,
        meeting_outcomes: [],
      };
      onCreated(newAppt);
      // Reset form
      setTitle('');
      setScheduledAt('');
      setDuration('60');
      setLocation('');
      setMeetingType('discovery');
      setOutcome('');
      setSummary('');
      setNextSteps('');
      setRescheduleReason('');
      setIsOpen(false);
    }

    setLoading(false);
  }

  const canSubmit =
    title.trim() !== '' &&
    scheduledAt !== '' &&
    (!isNeuTerminieren || rescheduleReason !== '');

  if (!isOpen) {
    return (
      <Button
        leftIcon={<Plus size={14} strokeWidth={2} />}
        onClick={() => setIsOpen(true)}
        bg="transparent"
        border="1px dashed var(--mist)"
        color="var(--mute)"
        fontFamily="var(--font-sans)"
        fontSize="13px"
        fontWeight={400}
        borderRadius="var(--radius-2)"
        h="38px"
        w="100%"
        _hover={{
          borderColor: 'var(--mute)',
          color: 'var(--ink)',
          bg: 'var(--frost)',
        }}
        transition="all 150ms ease"
      >
        Neues Meeting anlegen
      </Button>
    );
  }

  return (
    <Box
      bg="var(--frost)"
      border="1px solid var(--mist)"
      borderRadius="var(--radius-3)"
      p="var(--space-5)"
    >
      <Text
        fontFamily="var(--font-mono)"
        fontSize="10px"
        letterSpacing="0.12em"
        textTransform="uppercase"
        color="var(--mute)"
        mb="var(--space-4)"
      >
        — NEUES MEETING
      </Text>

      <VStack align="stretch" spacing="var(--space-4)">
        {/* Reschedule reason — required when isNeuTerminieren */}
        {isNeuTerminieren && (
          <Box>
            <Text
              fontFamily="var(--font-sans)"
              fontSize="13px"
              fontWeight={500}
              color="var(--ink)"
              mb="var(--space-2)"
            >
              Grund der Neuterminierung{' '}
              <Box as="span" color="rgba(239,68,68,0.8)" fontSize="12px">
                *
              </Box>
            </Text>
            <Select
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              {...inputStyle}
              icon={<ChevronDown size={14} />}
            >
              <option value="">Grund wählen...</option>
              {RESCHEDULE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Box>
        )}

        {/* Title */}
        <Box>
          <Text
            fontFamily="var(--font-sans)"
            fontSize="13px"
            fontWeight={500}
            color="var(--ink)"
            mb="var(--space-2)"
          >
            Titel *
          </Text>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. Discovery Call mit Acme GmbH"
            {...inputStyle}
          />
        </Box>

        {/* Date + Duration Row */}
        <HStack spacing="var(--space-3)">
          <Box flex={2}>
            <Text
              fontFamily="var(--font-sans)"
              fontSize="13px"
              fontWeight={500}
              color="var(--ink)"
              mb="var(--space-2)"
            >
              Datum & Uhrzeit *
            </Text>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              {...inputStyle}
            />
          </Box>
          <Box flex={1}>
            <Text
              fontFamily="var(--font-sans)"
              fontSize="13px"
              fontWeight={500}
              color="var(--ink)"
              mb="var(--space-2)"
            >
              Dauer (min)
            </Text>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min={15}
              step={15}
              {...inputStyle}
            />
          </Box>
        </HStack>

        {/* Meeting Type */}
        <Box>
          <Text
            fontFamily="var(--font-sans)"
            fontSize="13px"
            fontWeight={500}
            color="var(--ink)"
            mb="var(--space-2)"
          >
            Meeting-Typ
          </Text>
          <Select
            value={meetingType}
            onChange={(e) => setMeetingType(e.target.value as MeetingType)}
            {...inputStyle}
            icon={<ChevronDown size={14} />}
          >
            {(Object.entries(MEETING_TYPE_LABELS) as [MeetingType, string][]).map(
              ([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              )
            )}
          </Select>
        </Box>

        {/* Location */}
        <Box>
          <Text
            fontFamily="var(--font-sans)"
            fontSize="13px"
            fontWeight={500}
            color="var(--ink)"
            mb="var(--space-2)"
          >
            Ort / Link
          </Text>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Zoom-Link, Adresse..."
            {...inputStyle}
          />
        </Box>

        {/* Outcome */}
        <Box>
          <Text
            fontFamily="var(--font-sans)"
            fontSize="13px"
            fontWeight={500}
            color="var(--ink)"
            mb="var(--space-2)"
          >
            Outcome (optional)
          </Text>
          <Select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as MeetingOutcomeType | '')}
            {...inputStyle}
            icon={<ChevronDown size={14} />}
          >
            <option value="">Noch kein Outcome</option>
            {(Object.entries(OUTCOME_LABELS) as [MeetingOutcomeType, string][]).map(
              ([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              )
            )}
          </Select>
        </Box>

        {outcome && (
          <>
            <Box>
              <Text
                fontFamily="var(--font-sans)"
                fontSize="13px"
                fontWeight={500}
                color="var(--ink)"
                mb="var(--space-2)"
              >
                Zusammenfassung
              </Text>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Was wurde besprochen?"
                resize="none"
                rows={3}
                {...inputStyle}
              />
            </Box>
            <Box>
              <Text
                fontFamily="var(--font-sans)"
                fontSize="13px"
                fontWeight={500}
                color="var(--ink)"
                mb="var(--space-2)"
              >
                Next Steps
              </Text>
              <Input
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                placeholder="Was passiert als nächstes?"
                {...inputStyle}
              />
            </Box>
          </>
        )}

        {/* Actions */}
        <HStack justify="flex-end" spacing="var(--space-3)" pt={1}>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            fontFamily="var(--font-sans)"
            fontSize="13px"
            fontWeight={400}
            color="var(--mute)"
            bg="transparent"
            _hover={{ color: 'var(--ink)', bg: 'white' }}
            borderRadius="var(--radius-2)"
            px="var(--space-4)"
            h="34px"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={loading}
            isDisabled={!canSubmit}
            bg={canSubmit ? 'var(--forest)' : 'var(--mist)'}
            color={canSubmit ? 'var(--paper)' : 'var(--mute)'}
            fontFamily="var(--font-sans)"
            fontSize="13px"
            fontWeight={500}
            borderRadius="var(--radius-2)"
            px="var(--space-5)"
            h="34px"
            _hover={{ bg: canSubmit ? 'var(--glow)' : undefined }}
            _active={{ transform: 'scale(0.97)' }}
            transition="all 150ms ease"
            cursor={canSubmit ? 'pointer' : 'not-allowed'}
          >
            Speichern →
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
