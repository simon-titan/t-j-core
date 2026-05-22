'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, HStack, Text, Button, Tabs, TabList, Tab, TabPanels, TabPanel,
  useDisclosure,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { PitchWithRelations, PendingFollowup, TemplateOption, TimeRange } from './types';
import { filterByTimeRange } from './types';
import { KPIBar }            from './KPIBar';
import { FilterBar }         from './FilterBar';
import { PitchTable }        from './PitchTable';
import { FollowUpList }      from './FollowUpList';
import { NewPitchModal }     from './NewPitchModal';
import { LeadCreatedBanner } from './LeadCreatedBanner';
import { t } from '@/lib/toast';

const MotionBox = motion(Box);

interface Props {
  pitches:   PitchWithRelations[];
  templates: TemplateOption[];
  followups: PendingFollowup[];
  userId:    string;
  orgId:     string;
}

export function PitchTrackerClient({ pitches: initialPitches, templates, followups, userId, orgId }: Props) {
  const router                          = useRouter();
  const [pitches, setPitches]           = useState<PitchWithRelations[]>(initialPitches);
  const [timeRange, setTimeRange]       = useState<TimeRange>('30d');
  const [templateFilter, setTemplate]   = useState('');
  const [statusFilter, setStatus]       = useState('');
  const [bannerProspect, setBanner]     = useState<string | null | false>(false);
  const { isOpen, onOpen, onClose }     = useDisclosure();

  // Derived: filtered list for tab 1
  const filtered = pitches
    .filter(p => !templateFilter || p.template_id === templateFilter)
    .filter(p => !statusFilter   || p.status === statusFilter);

  const timeFiltered = filterByTimeRange(filtered, timeRange);

  function handleStatusChange(id: string, newStatus: 'answered' | 'sent') {
    setPitches(prev =>
      prev.map(p => p.id === id ? { ...p, status: newStatus, answered_at: newStatus === 'answered' ? new Date().toISOString() : null } : p)
    );
  }

  function handleLeadCreated(prospectName: string | null) {
    setBanner(prospectName);
  }

  function handleModalCreated(newPitch?: PitchWithRelations) {
    if (newPitch) {
      setPitches(prev => [newPitch, ...prev]);
    }
    t.success('Pitch erfolgreich erstellt');
    router.refresh();
  }

  function handleDeletePitch(id: string) {
    setPitches(prev => prev.filter(p => p.id !== id));
    t.success('Pitch gelöscht');
  }

  function handleNotesUpdated(id: string, notes: string | null) {
    setPitches(prev => prev.map(p => p.id === id ? { ...p, notes } : p));
  }

  function handleAppointmentCreated(
    pitchId: string,
    leadId: string,
    appt: { id: string; scheduled_at: string; status: string }
  ) {
    setPitches(prev => prev.map(p => {
      if (p.id !== pitchId) return p;
      const existingLead = p.leads?.[0];
      const lead = existingLead
        ? { ...existingLead, appointments: [appt] }
        : { id: leadId, status: 'contacted' as const, appointments: [appt] };
      return { ...p, leads: [lead] };
    }));
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
    >
      {/* Page Header */}
      <HStack justify="space-between" mb={7} align="flex-end">
        <Box>
          <Text
            fontFamily="var(--font-mono)"
            fontSize="10px"
            letterSpacing="0.14em"
            textTransform="uppercase"
            color="var(--mute)"
            mb={1}
          >
            — PITCH TRACKER
          </Text>
          <Text
            fontFamily="var(--font-display)"
            fontStyle="italic"
            fontSize={{ base: '36px', md: '48px' }}
            lineHeight={0.95}
            letterSpacing="-0.03em"
            color="var(--ink)"
          >
            Pitch Tracker.
          </Text>
        </Box>

        <Button
          leftIcon={<Plus size={15} strokeWidth={2.5} />}
          fontFamily="var(--font-sans)"
          fontSize="14px"
          fontWeight={500}
          bg="var(--ink)"
          color="var(--paper)"
          px={4}
          h="38px"
          borderRadius="var(--radius-2)"
          _hover={{ bg: 'var(--forest-deep)' }}
          onClick={onOpen}
        >
          Neuer Pitch
        </Button>
      </HStack>

      {/* Lead Created Banner */}
      <AnimatePresence>
        {bannerProspect !== false && (
          <LeadCreatedBanner
            prospectName={bannerProspect}
            onDismiss={() => setBanner(false)}
          />
        )}
      </AnimatePresence>

      {/* KPI Bar */}
      <KPIBar
        pitches={pitches}
        followups={followups}
        timeRange={timeRange}
        onTimeRange={setTimeRange}
      />

      {/* Filter Bar */}
      <FilterBar
        templates={templates}
        templateFilter={templateFilter}
        statusFilter={statusFilter}
        onTemplate={setTemplate}
        onStatus={setStatus}
      />

      {/* Tabs */}
      <Tabs variant="unstyled" defaultIndex={0}>
        <TabList
          borderBottom="1px solid var(--mist)"
          mb={5}
          gap={0}
        >
          {[
            { label: 'Alle Pitches', count: filtered.length },
            { label: 'Ausstehende Follow-Ups', count: followups.filter(f => f.status === 'pending').length },
          ].map(tab => (
            <Tab
              key={tab.label}
              fontFamily="var(--font-sans)"
              fontSize="13px"
              fontWeight={400}
              color="var(--mute)"
              px={0}
              pb={3}
              mr={6}
              borderBottom="2px solid transparent"
              _selected={{
                color:       'var(--ink)',
                fontWeight:  500,
                borderColor: 'var(--ink)',
              }}
              _hover={{ color: 'var(--ink)' }}
            >
              {tab.label}
              <Box
                as="span"
                ml={2}
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                w="18px"
                h="18px"
                borderRadius="full"
                bg="var(--mist)"
                fontFamily="var(--font-mono)"
                fontSize="10px"
                color="var(--mute)"
              >
                {tab.count}
              </Box>
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          <TabPanel px={0} pt={0}>
            <PitchTable
              pitches={timeFiltered}
              onStatusChange={handleStatusChange}
              onLeadCreated={handleLeadCreated}
              onDelete={handleDeletePitch}
              onNotesUpdated={handleNotesUpdated}
              onAppointmentCreated={handleAppointmentCreated}
              userId={userId}
              orgId={orgId}
            />
          </TabPanel>
          <TabPanel px={0} pt={0}>
            <FollowUpList followups={followups} />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* New Pitch Modal */}
      <NewPitchModal
        isOpen={isOpen}
        onClose={onClose}
        templates={templates}
        userId={userId}
        orgId={orgId}
        onCreated={handleModalCreated}
      />
    </MotionBox>
  );
}
