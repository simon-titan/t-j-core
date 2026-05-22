'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, HStack, Text, Button,
  Tabs, TabList, Tab, TabPanels, TabPanel,
  useDisclosure,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type {
  PitchWithRelations, PendingFollowup, TimeRange,
} from './types';
import { filterByTimeRange } from './types';
import { KPIBar }            from './KPIBar';
import { PitchTable }        from './PitchTable';
import { FollowUpList }      from './FollowUpList';
import { StickyAddRow }      from './StickyAddRow';
import { LeadCreatedBanner } from './LeadCreatedBanner';

const MotionBox = motion(Box);

interface Template {
  id:              string;
  name:            string;
  body:            string;
  target_audience: string | null;
}

interface Props {
  template:   Template | null; // null = "Ohne Template"
  pitches:    PitchWithRelations[];
  followups:  PendingFollowup[];
  userId:     string;
  orgId:      string;
}

export function PitchTrackerDetailClient({
  template,
  pitches: initialPitches,
  followups,
  userId,
  orgId,
}: Props) {
  const router = useRouter();
  const [pitches, setPitches]       = useState<PitchWithRelations[]>(initialPitches);
  const [timeRange, setTimeRange]   = useState<TimeRange>('30d');
  const [bannerProspect, setBanner] = useState<string | null | false>(false);
  const [bodyOpen, setBodyOpen]     = useState(false);

  const timeFiltered = filterByTimeRange(pitches, timeRange);

  function handleStatusChange(id: string, newStatus: 'answered' | 'sent') {
    setPitches(prev =>
      prev.map(p => p.id === id
        ? { ...p, status: newStatus, answered_at: newStatus === 'answered' ? new Date().toISOString() : null }
        : p
      )
    );
  }

  function handleLeadCreated(prospectName: string | null) {
    setBanner(prospectName);
  }

  function handleDeletePitch(id: string) {
    setPitches(prev => prev.filter(p => p.id !== id));
  }

  function handlePitchCreated(newPitch: PitchWithRelations) {
    setPitches(prev => [newPitch, ...prev]);
  }

  const templateId = template?.id ?? null;

  return (
    <MotionBox
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
    >
      {/* Back + Header */}
      <HStack mb={2} spacing={3} align="flex-start">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={14} strokeWidth={2.5} />}
          fontFamily="var(--font-sans)"
          fontSize="13px"
          color="var(--mute)"
          px={2}
          h="32px"
          mt="10px"
          _hover={{ color: 'var(--ink)', bg: 'var(--ink-04)' }}
          onClick={() => router.push('/app/pitch-tracker')}
          flexShrink={0}
        >
          Übersicht
        </Button>

        <Box flex={1}>
          <Text
            fontFamily="var(--font-mono)"
            fontSize="10px"
            letterSpacing="0.14em"
            textTransform="uppercase"
            color="var(--mute)"
            mb={1}
          >
            — PITCH TRACKER / TEMPLATE
          </Text>
          <Text
            fontFamily="var(--font-display)"
            fontStyle="italic"
            fontSize={{ base: '30px', md: '42px' }}
            lineHeight={0.95}
            letterSpacing="-0.03em"
            color="var(--ink)"
          >
            {template?.name ?? 'Ohne Template.'}
          </Text>

          {/* Target Audience */}
          {template?.target_audience && (
            <Box
              mt={2}
              display="inline-flex"
              px={2}
              py="3px"
              bg="rgba(74,124,92,0.08)"
              borderRadius="var(--radius-full)"
            >
              <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--forest)" fontWeight={500}>
                {template.target_audience}
              </Text>
            </Box>
          )}

          {/* Template Body Collapsible */}
          {template?.body && (
            <Box mt={3}>
              <Box
                as="button"
                onClick={() => setBodyOpen(o => !o)}
                fontFamily="var(--font-mono)"
                fontSize="9px"
                letterSpacing="0.10em"
                textTransform="uppercase"
                color="var(--mute)"
                cursor="pointer"
                _hover={{ color: 'var(--ink)' }}
                transition="color 120ms"
              >
                {bodyOpen ? '↑ Nachricht ausblenden' : '↓ Nachricht anzeigen'}
              </Box>
              <AnimatePresence>
                {bodyOpen && (
                  <MotionBox
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
                    overflow="hidden"
                  >
                    <Box
                      mt={3}
                      p={4}
                      bg="var(--frost)"
                      border="1px solid var(--mist)"
                      borderRadius="var(--radius-3)"
                      maxW="720px"
                    >
                      <Text
                        fontFamily="var(--font-sans)"
                        fontSize="13px"
                        color="var(--ink)"
                        whiteSpace="pre-wrap"
                        lineHeight={1.7}
                      >
                        {template.body}
                      </Text>
                    </Box>
                  </MotionBox>
                )}
              </AnimatePresence>
            </Box>
          )}
        </Box>
      </HStack>

      {/* Lead Banner */}
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

      {/* Tabs */}
      <Tabs variant="unstyled" defaultIndex={0}>
        <TabList borderBottom="1px solid var(--mist)" mb={0} gap={0}>
          {[
            { label: 'Pitches', count: timeFiltered.length },
            { label: 'Offene Follow-Ups', count: followups.filter(f => f.status === 'pending').length },
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
              _selected={{ color: 'var(--ink)', fontWeight: 500, borderColor: 'var(--ink)' }}
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
            {/* Sticky quick-add row */}
            <Box mt={5} mb={4}>
              <StickyAddRow
                templateId={templateId}
                orgId={orgId}
                userId={userId}
                onCreated={handlePitchCreated}
              />
            </Box>

            {/* Pitch Table */}
            <PitchTable
              pitches={timeFiltered}
              onStatusChange={handleStatusChange}
              onLeadCreated={handleLeadCreated}
              onDelete={handleDeletePitch}
              showSentBy={true}
            />
          </TabPanel>

          <TabPanel px={0} pt={0}>
            <FollowUpList followups={followups} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </MotionBox>
  );
}
