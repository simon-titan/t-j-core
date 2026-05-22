'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Text,
  HStack,
  Checkbox,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Euro, Mail, Phone } from 'lucide-react';
import type { KanbanLead, KanbanColumn, OrgProfile } from './types';
import { COLUMN_CONFIG, MEETING_TYPE_LABELS, getLeadDealValue, getInitials } from './types';

type SortKey = 'name' | 'company' | 'column' | 'meetingType' | 'nextAppt' | 'dealValue' | 'days';
type SortDir = 'asc' | 'desc';

interface Props {
  leads: KanbanLead[];
  profiles: OrgProfile[];
  onLeadOpen: (lead: KanbanLead) => void;
  bulkMode: boolean;
  selectedLeads: Set<string>;
  onSelectLead: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}

function SortHeader({
  label,
  sortKey,
  current,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <Box
      as="button"
      display="flex"
      alignItems="center"
      gap="4px"
      cursor="pointer"
      color={active ? 'var(--forest)' : 'var(--mute)'}
      _hover={{ color: 'var(--ink)' }}
      transition="color 150ms ease"
      bg="transparent"
      border="none"
      p={0}
      fontFamily="var(--font-mono)"
      fontSize="10px"
      letterSpacing="0.10em"
      textTransform="uppercase"
      fontWeight={active ? 700 : 400}
      onClick={() => onSort(sortKey)}
    >
      {label}
      {active ? (
        dir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />
      ) : null}
    </Box>
  );
}

const COLUMN_COLORS: Record<KanbanColumn, { color: string; bg: string }> = {
  anstehend: { color: 'var(--forest)', bg: 'rgba(74,124,92,0.10)' },
  heute_fällig: { color: 'var(--paper)', bg: 'var(--forest-deep)' },
  neu_terminieren: { color: '#854D0E', bg: 'rgba(234,179,8,0.10)' },
  closed: { color: 'var(--glow)', bg: 'rgba(74,124,92,0.12)' },
  rejected: { color: 'var(--mute)', bg: 'var(--frost)' },
};

export function ListView({
  leads,
  profiles,
  onLeadOpen,
  bulkMode,
  selectedLeads,
  onSelectLead,
  onSelectAll,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('nextAppt');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function handleSort(k: SortKey) {
    if (sortKey === k) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(k);
      setSortDir('asc');
    }
  }

  const sorted = useMemo(() => {
    return [...leads].sort((a, b) => {
      let va: string | number = 0;
      let vb: string | number = 0;
      switch (sortKey) {
        case 'name':
          va = `${a.prospect.first_name} ${a.prospect.last_name}`;
          vb = `${b.prospect.first_name} ${b.prospect.last_name}`;
          break;
        case 'company':
          va = a.prospect.company ?? '';
          vb = b.prospect.company ?? '';
          break;
        case 'column':
          va = a.column;
          vb = b.column;
          break;
        case 'meetingType':
          va = a.latestMeetingType ?? '';
          vb = b.latestMeetingType ?? '';
          break;
        case 'nextAppt':
          va = a.nextAppointment ? new Date(a.nextAppointment.scheduled_at).getTime() : Infinity;
          vb = b.nextAppointment ? new Date(b.nextAppointment.scheduled_at).getTime() : Infinity;
          break;
        case 'dealValue':
          va = getLeadDealValue(a);
          vb = getLeadDealValue(b);
          break;
        case 'days':
          va = a.daysSinceLastContact;
          vb = b.daysSinceLastContact;
          break;
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leads, sortKey, sortDir]);

  const allSelected = leads.length > 0 && leads.every((l) => selectedLeads.has(l.id));
  const someSelected = leads.some((l) => selectedLeads.has(l.id));

  return (
    <motion.div
      key="list"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
      style={{ height: '100%', overflowY: 'auto' }}
    >
      <TableContainer>
        <Table size="sm" variant="unstyled">
          <Thead position="sticky" top={0} zIndex={10} bg="var(--frost)">
            <Tr borderBottom="2px solid" borderBottomColor="var(--mist)">
              {bulkMode && (
                <Th w="40px" px="12px" py="10px">
                  <Checkbox
                    isChecked={allSelected}
                    isIndeterminate={someSelected && !allSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    colorScheme="green"
                    size="sm"
                  />
                </Th>
              )}
              <Th px="12px" py="10px">
                <SortHeader label="Name" sortKey="name" current={sortKey} dir={sortDir} onSort={handleSort} />
              </Th>
              <Th px="12px" py="10px">
                <SortHeader label="Firma" sortKey="company" current={sortKey} dir={sortDir} onSort={handleSort} />
              </Th>
              <Th px="12px" py="10px">
                <SortHeader label="Status" sortKey="column" current={sortKey} dir={sortDir} onSort={handleSort} />
              </Th>
              <Th px="12px" py="10px" display={{ base: 'none', md: 'table-cell' }}>
                <SortHeader label="Meeting-Typ" sortKey="meetingType" current={sortKey} dir={sortDir} onSort={handleSort} />
              </Th>
              <Th px="12px" py="10px">
                <SortHeader label="Nächster Termin" sortKey="nextAppt" current={sortKey} dir={sortDir} onSort={handleSort} />
              </Th>
              <Th px="12px" py="10px" isNumeric display={{ base: 'none', md: 'table-cell' }}>
                <SortHeader label="Deal €" sortKey="dealValue" current={sortKey} dir={sortDir} onSort={handleSort} />
              </Th>
              {profiles.length > 1 && (
                <Th px="12px" py="10px">
                  <Text fontFamily="var(--font-mono)" fontSize="10px" letterSpacing="0.10em" textTransform="uppercase" color="var(--mute)">
                    Assignee
                  </Text>
                </Th>
              )}
              <Th px="12px" py="10px" display={{ base: 'none', md: 'table-cell' }}>
                <SortHeader label="Tage" sortKey="days" current={sortKey} dir={sortDir} onSort={handleSort} />
              </Th>
              <Th px="12px" py="10px" w="80px">
                <Text fontFamily="var(--font-mono)" fontSize="10px" letterSpacing="0.10em" textTransform="uppercase" color="var(--mute)">
                  Kontakt
                </Text>
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {sorted.map((lead, i) => {
              const prospect = lead.prospect;
              const fullName = `${prospect.first_name} ${prospect.last_name}`;
              const initials = getInitials(prospect.first_name, prospect.last_name);
              const dealValue = getLeadDealValue(lead);
              const colStyle = COLUMN_COLORS[lead.column];
              const assignee = profiles.find((p) => p.id === lead.assigned_to);

              return (
                <Tr
                  key={lead.id}
                  borderBottom="1px solid"
                  borderBottomColor="var(--mist)"
                  bg={selectedLeads.has(lead.id) ? 'rgba(74,124,92,0.04)' : i % 2 === 0 ? 'var(--paper)' : 'var(--frost)'}
                  cursor="pointer"
                  _hover={{ bg: 'rgba(74,124,92,0.06)' }}
                  transition="background 120ms ease"
                  onClick={() => !bulkMode && onLeadOpen(lead)}
                >
                  {/* Bulk checkbox */}
                  {bulkMode && (
                    <Td px="12px" py="10px" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        isChecked={selectedLeads.has(lead.id)}
                        onChange={(e) => onSelectLead(lead.id, e.target.checked)}
                        colorScheme="green"
                        size="sm"
                      />
                    </Td>
                  )}

                  {/* Name + Avatar */}
                  <Td px="12px" py="10px">
                    <HStack spacing="8px">
                      <Box
                        w="26px"
                        h="26px"
                        borderRadius="full"
                        bg="var(--forest)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Text fontFamily="var(--font-sans)" fontSize="10px" fontWeight={700} color="var(--paper)">
                          {initials}
                        </Text>
                      </Box>
                      <Text fontFamily="var(--font-sans)" fontSize="13px" fontWeight={500} color="var(--ink)" noOfLines={1}>
                        {fullName}
                      </Text>
                    </HStack>
                  </Td>

                  {/* Company */}
                  <Td px="12px" py="10px">
                    <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--mute)" noOfLines={1}>
                      {prospect.company ?? '—'}
                    </Text>
                    {prospect.industry && (
                      <Text fontFamily="var(--font-sans)" fontSize="11px" color="var(--mist)" noOfLines={1}>
                        {prospect.industry}
                      </Text>
                    )}
                  </Td>

                  {/* Column/Status */}
                  <Td px="12px" py="10px">
                    <Box
                      display="inline-flex"
                      bg={colStyle.bg}
                      color={colStyle.color}
                      borderRadius="var(--radius-full)"
                      px="8px"
                      py="2px"
                      fontFamily="var(--font-sans)"
                      fontSize="11px"
                      fontWeight={600}
                    >
                      {COLUMN_CONFIG[lead.column].label}
                    </Box>
                  </Td>

                  {/* Meeting type */}
                  <Td px="12px" py="10px" display={{ base: 'none', md: 'table-cell' }}>
                    <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--mute)">
                      {lead.latestMeetingType ? MEETING_TYPE_LABELS[lead.latestMeetingType] : '—'}
                    </Text>
                  </Td>

                  {/* Next appointment */}
                  <Td px="12px" py="10px">
                    <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--ink)">
                      {lead.nextAppointment
                        ? new Date(lead.nextAppointment.scheduled_at).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </Text>
                  </Td>

                  {/* Deal value */}
                  <Td px="12px" py="10px" isNumeric display={{ base: 'none', md: 'table-cell' }}>
                    {dealValue > 0 ? (
                      <HStack spacing="3px" justify="flex-end">
                        <Euro size={10} color="var(--forest)" />
                        <Text fontFamily="var(--font-mono)" fontSize="12px" fontWeight={600} color="var(--forest)">
                          {dealValue.toLocaleString('de-DE')}
                        </Text>
                      </HStack>
                    ) : (
                      <Text fontFamily="var(--font-mono)" fontSize="12px" color="var(--mist)">—</Text>
                    )}
                  </Td>

                  {/* Assignee */}
                  {profiles.length > 1 && (
                    <Td px="12px" py="10px">
                      <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--mute)" noOfLines={1}>
                        {assignee?.full_name ?? '—'}
                      </Text>
                    </Td>
                  )}

                  {/* Days since contact */}
                  <Td px="12px" py="10px" display={{ base: 'none', md: 'table-cell' }}>
                    <Text
                      fontFamily="var(--font-mono)"
                      fontSize="12px"
                      color={lead.daysSinceLastContact > 7 ? '#854D0E' : 'var(--mute)'}
                      fontWeight={lead.daysSinceLastContact > 7 ? 600 : 400}
                    >
                      {lead.daysSinceLastContact === 0 ? 'Heute' : `${lead.daysSinceLastContact}d`}
                    </Text>
                  </Td>

                  {/* Quick contact */}
                  <Td px="12px" py="10px" onClick={(e) => e.stopPropagation()}>
                    <HStack spacing="4px">
                      {prospect.email && (
                        <Box
                          as="a"
                          href={`mailto:${prospect.email}`}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          w="24px"
                          h="24px"
                          borderRadius="var(--radius-2)"
                          color="var(--mute)"
                          _hover={{ bg: 'var(--mist)', color: 'var(--forest)' }}
                          transition="all 120ms ease"
                        >
                          <Mail size={12} strokeWidth={1.5} />
                        </Box>
                      )}
                      {prospect.phone && (
                        <Box
                          as="a"
                          href={`tel:${prospect.phone}`}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          w="24px"
                          h="24px"
                          borderRadius="var(--radius-2)"
                          color="var(--mute)"
                          _hover={{ bg: 'var(--mist)', color: 'var(--forest)' }}
                          transition="all 120ms ease"
                        >
                          <Phone size={12} strokeWidth={1.5} />
                        </Box>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              );
            })}

            {leads.length === 0 && (
              <Tr>
                <Td colSpan={99} px="12px" py="48px" textAlign="center">
                  <Text fontFamily="var(--font-mono)" fontSize="11px" letterSpacing="0.08em" textTransform="uppercase" color="var(--mist)">
                    Keine Leads gefunden
                  </Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </motion.div>
  );
}
