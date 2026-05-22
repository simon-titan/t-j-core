'use client';

import { useState } from 'react';
import { Box, Text, VStack, HStack, Link } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Linkedin,
  Mail,
  Phone,
  Globe,
  Building2,
  Users,
  ChevronDown,
  ChevronRight,
  MapPin,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  CalendarClock,
} from 'lucide-react';
import type { KanbanLead, KanbanAppointment, LeadStatus, MeetingSystem } from './types';
import {
  deriveKanbanColumn,
  calcDaysSinceLastContact,
  getLeadDealValue,
  getInitials,
} from './types';
import { MeetingTimeline } from './MeetingTimeline';
import { NewMeetingForm } from './NewMeetingForm';
import { QualificationNotes } from './QualificationNotes';
import { DealInfo } from './DealInfo';
import { MeetingLiveView } from './MeetingLiveView';

const MotionBox = motion(Box);

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const panelVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { duration: 0.35, ease: [0.65, 0, 0.35, 1] },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.22, ease: [0.65, 0, 0.35, 1] },
  },
};

const STATUS_CONFIG: Record<string, { bg: string; color: string; border: string; label: string }> = {
  new:         { bg: 'rgba(14,14,12,0.06)',     color: 'var(--mute)',    border: 'rgba(14,14,12,0.12)',    label: 'Neu' },
  contacted:   { bg: 'rgba(74,124,92,0.08)',    color: 'var(--forest)',  border: 'rgba(74,124,92,0.18)',   label: 'Kontaktiert' },
  qualified:   { bg: 'rgba(74,124,92,0.14)',    color: 'var(--forest)',  border: 'rgba(74,124,92,0.25)',   label: 'Qualifiziert' },
  proposal:    { bg: 'rgba(234,179,8,0.12)',    color: '#854D0E',        border: 'rgba(234,179,8,0.25)',   label: 'Angebot' },
  negotiating: { bg: 'rgba(74,124,92,0.20)',    color: 'var(--forest)',  border: 'rgba(74,124,92,0.30)',   label: 'Verhandlung' },
  won:         { bg: 'rgba(34,197,94,0.12)',    color: '#166534',        border: 'rgba(34,197,94,0.25)',   label: 'Gewonnen' },
  lost:        { bg: 'rgba(239,68,68,0.10)',    color: '#991B1B',        border: 'rgba(239,68,68,0.20)',   label: 'Verloren' },
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatEuro(v: number): string {
  return v >= 1000
    ? `€${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`
    : `€${v.toLocaleString('de-DE')}`;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string | number;
}

function PanelSection({ title, children, defaultOpen = true, badge }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Box>
      <HStack
        as="button"
        w="100%"
        justify="space-between"
        align="center"
        onClick={() => setOpen(!open)}
        py="14px"
        _hover={{ opacity: 0.75 }}
        transition="opacity 150ms ease"
      >
        <HStack spacing="var(--space-3)" align="center">
          <Text
            fontFamily="var(--font-mono)"
            fontSize="10px"
            letterSpacing="0.12em"
            textTransform="uppercase"
            color="var(--mute)"
          >
            — {title}
          </Text>
          {badge !== undefined && (
            <Box
              bg="var(--frost)"
              borderRadius="var(--radius-full)"
              px="7px"
              py="1px"
              fontFamily="var(--font-mono)"
              fontSize="10px"
              color="var(--mute)"
            >
              {badge}
            </Box>
          )}
        </HStack>
        {open ? (
          <ChevronDown size={14} strokeWidth={1.5} color="var(--mute)" />
        ) : (
          <ChevronRight size={14} strokeWidth={1.5} color="var(--mute)" />
        )}
      </HStack>

      {open && <Box pb="var(--space-5)">{children}</Box>}

      <Box h="1px" bg="var(--mist)" />
    </Box>
  );
}

interface Props {
  lead: KanbanLead;
  onClose: () => void;
  onLeadUpdate: (lead: KanbanLead) => void;
  userId: string;
  orgId: string;
}

export function DetailPanel({ lead, onClose, onLeadUpdate, userId, orgId }: Props) {
  const [localLead, setLocalLead] = useState<KanbanLead>(lead);
  const [meetingViewAppt, setMeetingViewAppt] = useState<KanbanAppointment | null>(null);

  function updateLead(partial: Partial<KanbanLead>) {
    const updated = { ...localLead, ...partial };
    updated.column = deriveKanbanColumn(updated.status, updated.appointments);
    updated.daysSinceLastContact = calcDaysSinceLastContact(updated.appointments, updated.created_at);
    const futureScheduled = updated.appointments
      .filter((a) => a.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    updated.nextAppointment = futureScheduled[0] ?? null;
    setLocalLead(updated);
    onLeadUpdate(updated);
  }

  function handleNewMeeting(appt: KanbanAppointment) {
    updateLead({ appointments: [...localLead.appointments, appt] });
  }

  function handleNotesUpdate(fields: {
    pain_points: string | null;
    objections: string | null;
    notes: string | null;
  }) {
    updateLead(fields);
  }

  function handleDealUpdate(fields: { status?: LeadStatus; meeting_system?: MeetingSystem | null }) {
    updateLead(fields as Partial<KanbanLead>);
  }

  const prospect = localLead.prospect;
  const fullName = `${prospect.first_name} ${prospect.last_name}`;
  const initials = getInitials(prospect.first_name, prospect.last_name);
  const totalDealValue = getLeadDealValue(localLead);
  const isNeuTerminieren = localLead.column === 'neu_terminieren';
  const isRejected = localLead.column === 'rejected';
  const statusCfg = STATUS_CONFIG[localLead.status] ?? STATUS_CONFIG.new;

  const hasQualInfo = !!(localLead.pain_points || localLead.objections || localLead.notes);

  return (
    <>
      {/* Backdrop */}
      <MotionBox
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        position="fixed"
        inset={0}
        bg="rgba(14,14,12,0.40)"
        backdropFilter="blur(3px)"
        zIndex={150}
        onClick={onClose}
      />

      {/* Panel */}
      <MotionBox
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        position="fixed"
        top={0}
        right={0}
        bottom={0}
        w={{ base: '100vw', md: '560px' }}
        bg="var(--paper)"
        borderLeft="1px solid var(--mist)"
        boxShadow="-8px 0 40px rgba(14,14,12,0.12)"
        zIndex={151}
        display="flex"
        flexDirection="column"
        overflowY="hidden"
      >
        {/* ── Dark Gradient Header ── */}
        <Box
          background="linear-gradient(160deg, #0A0F0D 0%, #122620 60%, #1a3528 100%)"
          px="28px"
          pt="28px"
          pb="20px"
          position="relative"
          overflow="hidden"
          flexShrink={0}
        >
          {/* texture overlay */}
          <Box
            position="absolute"
            inset={0}
            pointerEvents="none"
            opacity={0.025}
            backgroundImage="url(%22data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E%22)"
          />

          {/* Subtle forest accent line top */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="2px"
            bg="linear-gradient(90deg, transparent 0%, rgba(74,124,92,0.7) 40%, rgba(74,124,92,0.4) 100%)"
          />

          {/* Close button */}
          <Box
            as="button"
            onClick={onClose}
            position="absolute"
            top="20px"
            right="20px"
            w="32px"
            h="32px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="var(--radius-2)"
            color="rgba(252,252,253,0.45)"
            bg="rgba(252,252,253,0.06)"
            _hover={{ color: 'var(--paper)', bg: 'rgba(252,252,253,0.12)' }}
            transition="all 150ms ease"
          >
            <X size={16} strokeWidth={2} />
          </Box>

          {/* Avatar + Name */}
          <HStack spacing="16px" align="flex-start" mb="20px" pr="40px">
            <Box
              flexShrink={0}
              w="52px"
              h="52px"
              borderRadius="var(--radius-full)"
              bg={isRejected ? 'rgba(239,68,68,0.20)' : 'rgba(74,124,92,0.25)'}
              border="2px solid"
              borderColor={isRejected ? 'rgba(239,68,68,0.35)' : 'rgba(74,124,92,0.40)'}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text
                fontFamily="var(--font-sans)"
                fontSize="18px"
                fontWeight={700}
                color={isRejected ? '#FCA5A5' : 'rgba(252,252,253,0.90)'}
                lineHeight={1}
              >
                {initials}
              </Text>
            </Box>

            <VStack align="flex-start" spacing="3px" flex={1} minW={0}>
              <Text
                fontFamily="var(--font-display)"
                fontStyle="italic"
                fontSize="26px"
                lineHeight={1.1}
                letterSpacing="-0.025em"
                color="var(--paper)"
                noOfLines={1}
              >
                {fullName}
              </Text>
              {prospect.position && (
                <Text
                  fontFamily="var(--font-sans)"
                  fontSize="13px"
                  color="rgba(252,252,253,0.55)"
                  noOfLines={1}
                >
                  {prospect.position}
                </Text>
              )}
              {prospect.company && (
                <HStack spacing="6px">
                  <Building2 size={11} color="rgba(252,252,253,0.35)" />
                  <Text
                    fontFamily="var(--font-sans)"
                    fontSize="12px"
                    color="rgba(252,252,253,0.40)"
                    noOfLines={1}
                  >
                    {prospect.company}
                    {prospect.industry ? ` · ${prospect.industry}` : ''}
                  </Text>
                </HStack>
              )}
            </VStack>
          </HStack>

          {/* Status + Days + Quick Actions */}
          <HStack justify="space-between" align="center">
            <HStack spacing="10px" flexWrap="wrap">
              <Box
                bg={isRejected ? 'rgba(239,68,68,0.20)' : 'rgba(252,252,253,0.10)'}
                border="1px solid"
                borderColor={isRejected ? 'rgba(239,68,68,0.30)' : 'rgba(252,252,253,0.15)'}
                borderRadius="var(--radius-full)"
                px="10px"
                py="3px"
                fontFamily="var(--font-sans)"
                fontSize="12px"
                fontWeight={500}
                color={isRejected ? '#FCA5A5' : 'rgba(252,252,253,0.80)'}
              >
                {statusCfg.label}
              </Box>
              <Text
                fontFamily="var(--font-mono)"
                fontSize="10px"
                color="rgba(252,252,253,0.30)"
                letterSpacing="0.08em"
              >
                {localLead.daysSinceLastContact === 0
                  ? 'Heute kontaktiert'
                  : `${localLead.daysSinceLastContact}d kein Kontakt`}
              </Text>
            </HStack>

            {/* Quick action icons */}
            <HStack spacing="6px">
              {prospect.email && (
                <Box
                  as="a"
                  href={`mailto:${prospect.email}`}
                  w="32px"
                  h="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="var(--radius-2)"
                  color="rgba(252,252,253,0.45)"
                  bg="rgba(252,252,253,0.06)"
                  _hover={{ color: 'var(--paper)', bg: 'rgba(74,124,92,0.30)' }}
                  transition="all 150ms ease"
                  title={prospect.email}
                >
                  <Mail size={14} strokeWidth={1.5} />
                </Box>
              )}
              {prospect.phone && (
                <Box
                  as="a"
                  href={`tel:${prospect.phone}`}
                  w="32px"
                  h="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="var(--radius-2)"
                  color="rgba(252,252,253,0.45)"
                  bg="rgba(252,252,253,0.06)"
                  _hover={{ color: 'var(--paper)', bg: 'rgba(74,124,92,0.30)' }}
                  transition="all 150ms ease"
                  title={prospect.phone}
                >
                  <Phone size={14} strokeWidth={1.5} />
                </Box>
              )}
              {prospect.linkedin_url && (
                <Box
                  as="a"
                  href={prospect.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  w="32px"
                  h="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="var(--radius-2)"
                  color="rgba(252,252,253,0.45)"
                  bg="rgba(252,252,253,0.06)"
                  _hover={{ color: 'var(--paper)', bg: 'rgba(74,124,92,0.30)' }}
                  transition="all 150ms ease"
                  title="LinkedIn"
                >
                  <Linkedin size={14} strokeWidth={1.5} />
                </Box>
              )}
            </HStack>
          </HStack>
        </Box>

        {/* ── KPI Strip ── */}
        <HStack
          spacing={0}
          divider={<Box w="1px" h="32px" bg="var(--mist)" flexShrink={0} />}
          bg="var(--frost)"
          borderBottom="1px solid var(--mist)"
          px={0}
          flexShrink={0}
        >
          <Box flex={1} px="20px" py="12px">
            <Text
              fontFamily="var(--font-mono)"
              fontSize="9px"
              letterSpacing="0.12em"
              textTransform="uppercase"
              color="var(--mute)"
              mb="3px"
            >
              Deal-Wert
            </Text>
            <Text
              fontFamily="var(--font-display)"
              fontStyle="italic"
              fontSize="20px"
              lineHeight={1}
              letterSpacing="-0.02em"
              color={totalDealValue > 0 ? 'var(--forest)' : 'var(--mist)'}
            >
              {totalDealValue > 0 ? formatEuro(totalDealValue) : '—'}
            </Text>
          </Box>

          <Box flex={1} px="20px" py="12px">
            <Text
              fontFamily="var(--font-mono)"
              fontSize="9px"
              letterSpacing="0.12em"
              textTransform="uppercase"
              color="var(--mute)"
              mb="3px"
            >
              Meetings
            </Text>
            <Text
              fontFamily="var(--font-display)"
              fontStyle="italic"
              fontSize="20px"
              lineHeight={1}
              letterSpacing="-0.02em"
              color="var(--ink)"
            >
              {localLead.appointments.length}
            </Text>
          </Box>

          <Box flex={2} px="20px" py="12px">
            <Text
              fontFamily="var(--font-mono)"
              fontSize="9px"
              letterSpacing="0.12em"
              textTransform="uppercase"
              color="var(--mute)"
              mb="3px"
            >
              Nächstes Meeting
            </Text>
            {localLead.nextAppointment ? (
              <Text
                fontFamily="var(--font-sans)"
                fontSize="13px"
                fontWeight={500}
                color="var(--ink)"
                noOfLines={1}
              >
                {fmtDate(localLead.nextAppointment.scheduled_at)}
              </Text>
            ) : (
              <Text
                fontFamily="var(--font-sans)"
                fontSize="13px"
                color="var(--mist)"
              >
                Nicht geplant
              </Text>
            )}
          </Box>

          {/* Meeting Modus Button */}
          <Box
            as="button"
            onClick={() => setMeetingViewAppt(localLead.nextAppointment ?? localLead.appointments[0] ?? null)}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap="4px"
            px="16px"
            py="12px"
            flexShrink={0}
            bg="transparent"
            color={localLead.nextAppointment ? 'var(--forest)' : 'var(--mute)'}
            _hover={{ bg: 'rgba(74,124,92,0.06)', color: 'var(--forest)' }}
            transition="all 150ms ease"
            borderLeft="1px solid var(--mist)"
            h="100%"
            disabled={localLead.appointments.length === 0}
            title="Meeting Modus öffnen"
          >
            <CalendarClock size={18} strokeWidth={1.5} />
            <Text
              fontFamily="var(--font-mono)"
              fontSize="9px"
              letterSpacing="0.10em"
              textTransform="uppercase"
              fontWeight={500}
              whiteSpace="nowrap"
            >
              Meeting Modus
            </Text>
          </Box>
        </HStack>

        {/* ── Scrollable Content ── */}
        <Box
          flex={1}
          overflowY="auto"
          px="28px"
          sx={{
            '&::-webkit-scrollbar': { width: '3px' },
            '&::-webkit-scrollbar-track': { bg: 'transparent' },
            '&::-webkit-scrollbar-thumb': { bg: 'var(--mist)', borderRadius: 'full' },
          }}
        >
          {/* Qualifikations-Highlights (wenn vorhanden — prominent oben) */}
          {hasQualInfo && (
            <PanelSection title="Qualifikation" defaultOpen>
              <VStack align="stretch" spacing="10px">
                {localLead.pain_points && (
                  <Box
                    bg="rgba(74,124,92,0.05)"
                    border="1px solid rgba(74,124,92,0.12)"
                    borderLeft="3px solid var(--forest)"
                    borderRadius="var(--radius-2)"
                    p="14px"
                  >
                    <HStack spacing="8px" mb="6px">
                      <TrendingUp size={12} color="var(--forest)" />
                      <Text
                        fontFamily="var(--font-mono)"
                        fontSize="9px"
                        letterSpacing="0.12em"
                        textTransform="uppercase"
                        color="var(--forest)"
                      >
                        Pain Points
                      </Text>
                    </HStack>
                    <Text
                      fontFamily="var(--font-sans)"
                      fontSize="13px"
                      color="var(--ink)"
                      lineHeight={1.6}
                    >
                      {localLead.pain_points}
                    </Text>
                  </Box>
                )}
                {localLead.objections && (
                  <Box
                    bg="rgba(234,179,8,0.04)"
                    border="1px solid rgba(234,179,8,0.15)"
                    borderLeft="3px solid #D97706"
                    borderRadius="var(--radius-2)"
                    p="14px"
                  >
                    <HStack spacing="8px" mb="6px">
                      <AlertCircle size={12} color="#D97706" />
                      <Text
                        fontFamily="var(--font-mono)"
                        fontSize="9px"
                        letterSpacing="0.12em"
                        textTransform="uppercase"
                        color="#854D0E"
                      >
                        Einwände
                      </Text>
                    </HStack>
                    <Text
                      fontFamily="var(--font-sans)"
                      fontSize="13px"
                      color="var(--ink)"
                      lineHeight={1.6}
                    >
                      {localLead.objections}
                    </Text>
                  </Box>
                )}
                {localLead.notes && (
                  <Box
                    bg="var(--frost)"
                    border="1px solid var(--mist)"
                    borderLeft="3px solid var(--mist)"
                    borderRadius="var(--radius-2)"
                    p="14px"
                  >
                    <HStack spacing="8px" mb="6px">
                      <MessageSquare size={12} color="var(--mute)" />
                      <Text
                        fontFamily="var(--font-mono)"
                        fontSize="9px"
                        letterSpacing="0.12em"
                        textTransform="uppercase"
                        color="var(--mute)"
                      >
                        Notizen
                      </Text>
                    </HStack>
                    <Text
                      fontFamily="var(--font-sans)"
                      fontSize="13px"
                      color="var(--ink)"
                      lineHeight={1.6}
                    >
                      {localLead.notes}
                    </Text>
                  </Box>
                )}
              </VStack>
            </PanelSection>
          )}

          {/* Kontaktdaten */}
          <PanelSection title="Kontaktdaten" defaultOpen>
            <VStack align="stretch" spacing={0} divider={<Box h="1px" bg="var(--mist)" />}>
              {prospect.email && (
                <HStack spacing="12px" py="10px">
                  <Mail size={14} strokeWidth={1.5} color="var(--mute)" style={{ flexShrink: 0 }} />
                  <Link href={`mailto:${prospect.email}`} fontFamily="var(--font-sans)" fontSize="13px" color="var(--ink)" _hover={{ color: 'var(--forest)' }} isExternal noOfLines={1} flex={1} minW={0}>
                    {prospect.email}
                  </Link>
                </HStack>
              )}
              {prospect.phone && (
                <HStack spacing="12px" py="10px">
                  <Phone size={14} strokeWidth={1.5} color="var(--mute)" style={{ flexShrink: 0 }} />
                  <Link href={`tel:${prospect.phone}`} fontFamily="var(--font-sans)" fontSize="13px" color="var(--ink)" _hover={{ color: 'var(--forest)' }} noOfLines={1} flex={1} minW={0}>
                    {prospect.phone}
                  </Link>
                </HStack>
              )}
              {prospect.linkedin_url && (
                <HStack spacing="12px" py="10px">
                  <Linkedin size={14} strokeWidth={1.5} color="var(--mute)" style={{ flexShrink: 0 }} />
                  <Link href={prospect.linkedin_url} fontFamily="var(--font-sans)" fontSize="13px" color="var(--ink)" _hover={{ color: 'var(--forest)' }} isExternal noOfLines={1} flex={1} minW={0}>
                    LinkedIn Profil
                  </Link>
                </HStack>
              )}
              {prospect.website && (
                <HStack spacing="12px" py="10px">
                  <Globe size={14} strokeWidth={1.5} color="var(--mute)" style={{ flexShrink: 0 }} />
                  <Link href={prospect.website} fontFamily="var(--font-sans)" fontSize="13px" color="var(--ink)" _hover={{ color: 'var(--forest)' }} isExternal noOfLines={1} flex={1} minW={0}>
                    {prospect.website.replace(/^https?:\/\//, '')}
                  </Link>
                </HStack>
              )}
              {prospect.industry && (
                <HStack spacing="12px" py="10px">
                  <Building2 size={14} strokeWidth={1.5} color="var(--mute)" style={{ flexShrink: 0 }} />
                  <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--ink)" noOfLines={1} flex={1} minW={0}>
                    {prospect.industry}
                  </Text>
                </HStack>
              )}
              {prospect.company_size && (
                <HStack spacing="12px" py="10px">
                  <Users size={14} strokeWidth={1.5} color="var(--mute)" style={{ flexShrink: 0 }} />
                  <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--ink)" noOfLines={1} flex={1} minW={0}>
                    {prospect.company_size} Mitarbeitende
                  </Text>
                </HStack>
              )}
              {prospect.position && (
                <HStack spacing="12px" py="10px">
                  <MapPin size={14} strokeWidth={1.5} color="var(--mute)" style={{ flexShrink: 0 }} />
                  <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--ink)" noOfLines={1} flex={1} minW={0}>
                    {prospect.position}
                  </Text>
                </HStack>
              )}
            </VStack>
          </PanelSection>

          {/* Meeting Timeline */}
          <PanelSection title="Meeting-Timeline" defaultOpen badge={localLead.appointments.length}>
            <MeetingTimeline
              appointments={localLead.appointments}
              onOpenNotes={(appt) => setMeetingViewAppt(appt)}
            />
          </PanelSection>

          {/* Neues Meeting */}
          <PanelSection title="Neues Meeting anlegen" defaultOpen={isNeuTerminieren}>
            <NewMeetingForm
              lead={localLead}
              isNeuTerminieren={isNeuTerminieren}
              onCreated={handleNewMeeting}
            />
          </PanelSection>

          {/* Qualifikations-Notizen Editor */}
          <PanelSection title="Qualifikations-Notizen bearbeiten" defaultOpen={false}>
            <QualificationNotes lead={localLead} onUpdate={handleNotesUpdate} />
          </PanelSection>

          {/* Deal-Info */}
          <PanelSection title="Deal-Info" defaultOpen={false}>
            <DealInfo lead={localLead} onUpdate={handleDealUpdate} />
          </PanelSection>

          <Box h="var(--space-8)" />
        </Box>
      </MotionBox>

      {/* ── Meeting Live View (full-screen, above everything) ── */}
      <AnimatePresence>
        {meetingViewAppt && (
          <MeetingLiveView
            appointment={meetingViewAppt}
            lead={localLead}
            userId={userId}
            orgId={orgId}
            onClose={() => setMeetingViewAppt(null)}
            onNotesUpdate={(updatedAppt) => {
              const updatedAppts = localLead.appointments.map((a) =>
                a.id === updatedAppt.id ? updatedAppt : a
              );
              updateLead({ appointments: updatedAppts });
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
