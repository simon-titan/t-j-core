'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, HStack, Text } from '@chakra-ui/react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, List, CalendarDays, CheckSquare, Square } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { t } from '@/lib/toast';
import type {
  KanbanLead,
  KanbanColumn,
  ViewMode,
  FilterState,
  OrgProfile,
} from './types';
import {
  COLUMN_ORDER,
  COLUMN_CONFIG,
  EMPTY_FILTER,
  filterLeads,
} from './types';
import { KanbanColumn as KanbanColumnComponent } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { FilterBar } from './FilterBar';
import { PipelineStats } from './PipelineStats';
import { ListView } from './ListView';
import { CalendarView } from './CalendarView';
import { BulkActionBar } from './BulkActionBar';
import { RescheduleModal } from './RescheduleModal';
import { DetailPanel } from './DetailPanel';

const columnStaggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const columnEntryVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.65, 0, 0.35, 1] },
  },
};

interface Props {
  initialLeads: KanbanLead[];
  profiles: OrgProfile[];
  userId: string;
  orgId: string;
}

interface PendingDrop {
  leadId: string;
  targetColumn: KanbanColumn;
}

const VIEW_TABS: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'kanban', icon: <LayoutGrid size={14} strokeWidth={1.5} />, label: 'Kanban' },
  { mode: 'list', icon: <List size={14} strokeWidth={1.5} />, label: 'Liste' },
  { mode: 'calendar', icon: <CalendarDays size={14} strokeWidth={1.5} />, label: 'Kalender' },
];

export function KanbanBoard({ initialLeads, profiles, userId, orgId }: Props) {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [leads, setLeads] = useState<KanbanLead[]>(initialLeads);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [collapsedColumns, setCollapsedColumns] = useState<Set<KanbanColumn>>(new Set());
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedLead, setSelectedLead] = useState<KanbanLead | null>(null);
  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

  useEffect(() => {
    const linkedLeadId = searchParams.get('lead');
    if (linkedLeadId) {
      const found = initialLeads.find((l) => l.id === linkedLeadId) ?? null;
      setSelectedLead(found);
    }
  }, [searchParams, initialLeads]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const filteredLeads = useMemo(() => filterLeads(leads, filter), [leads, filter]);

  const grouped = useMemo(() => {
    const map: Record<KanbanColumn, KanbanLead[]> = {
      anstehend: [],
      heute_fällig: [],
      neu_terminieren: [],
      closed: [],
      rejected: [],
    };
    filteredLeads.forEach((l) => map[l.column].push(l));
    return map;
  }, [filteredLeads]);

  const activeLead = useMemo(
    () => leads.find((l) => l.id === activeLeadId) ?? null,
    [leads, activeLeadId]
  );

  // ── Bulk helpers ──────────────────────────────────────────────────────────

  function toggleBulkMode() {
    setBulkMode((v) => {
      if (v) setSelectedLeads(new Set());
      return !v;
    });
  }

  function handleSelectLead(id: string, selected: boolean) {
    setSelectedLeads((prev) => {
      const next = new Set(prev);
      selected ? next.add(id) : next.delete(id);
      return next;
    });
  }

  function handleSelectAll(column: KanbanColumn, selected: boolean) {
    setSelectedLeads((prev) => {
      const next = new Set(prev);
      grouped[column].forEach((l) => selected ? next.add(l.id) : next.delete(l.id));
      return next;
    });
  }

  function handleSelectAllLeads(selected: boolean) {
    setSelectedLeads(selected ? new Set(filteredLeads.map((l) => l.id)) : new Set());
  }

  function handleClearSelection() {
    setSelectedLeads(new Set());
    setBulkMode(false);
  }

  // ── Bulk assign / move ────────────────────────────────────────────────────

  async function handleBulkAssign(leadIds: string[], profileId: string) {
    const prevLeads = leads;
    setLeads((prev) =>
      prev.map((l) => leadIds.includes(l.id) ? { ...l, assigned_to: profileId } : l)
    );
    const { error } = await (supabase.from('leads') as any)
      .update({ assigned_to: profileId })
      .in('id', leadIds);
    if (error) {
      setLeads(prevLeads);
      t.error('Fehler beim Zuweisen');
    } else {
      t.success(`${leadIds.length} Lead${leadIds.length !== 1 ? 's' : ''} zugewiesen`);
      setSelectedLeads(new Set());
    }
  }

  async function handleBulkMove(leadIds: string[], targetColumn: KanbanColumn) {
    const prevLeads = leads;
    const statusMap: Partial<Record<KanbanColumn, string>> = {
      closed: 'won',
      rejected: 'lost',
    };
    const newStatus = statusMap[targetColumn];

    setLeads((prev) =>
      prev.map((l) => {
        if (!leadIds.includes(l.id)) return l;
        return { ...l, column: targetColumn, ...(newStatus ? { status: newStatus as any } : {}) };
      })
    );

    const update: Record<string, string> = {};
    if (newStatus) update.status = newStatus;

    if (Object.keys(update).length > 0) {
      const { error } = await (supabase.from('leads') as any).update(update).in('id', leadIds);
      if (error) {
        setLeads(prevLeads);
        t.error('Fehler beim Verschieben');
        return;
      }
    }
    t.success(`${leadIds.length} Lead${leadIds.length !== 1 ? 's' : ''} verschoben`);
    setSelectedLeads(new Set());
  }

  // ── Column collapse ───────────────────────────────────────────────────────

  function toggleColumnCollapse(col: KanbanColumn) {
    setCollapsedColumns((prev) => {
      const next = new Set(prev);
      next.has(col) ? next.delete(col) : next.add(col);
      return next;
    });
  }

  // ── DnD ──────────────────────────────────────────────────────────────────

  function handleDragStart(event: any) {
    setActiveLeadId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveLeadId(null);
    const { active, over } = event;
    if (!over) return;
    const leadId = active.id as string;
    const targetColumn = over.id as KanbanColumn;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.column === targetColumn) return;
    if (!COLUMN_CONFIG[targetColumn]?.acceptsDrop) return;
    if (targetColumn === 'neu_terminieren') {
      setPendingDrop({ leadId, targetColumn });
      return;
    }
    applyColumnChange(leadId, targetColumn);
  }

  async function applyColumnChange(leadId: string, targetColumn: KanbanColumn) {
    const prevLeads = leads;
    if (targetColumn === 'closed') {
      setLeads((prev) =>
        prev.map((l) => l.id === leadId ? { ...l, status: 'won', column: 'closed' } : l)
      );
      const { error } = await (supabase.from('leads') as any).update({ status: 'won' }).eq('id', leadId);
      if (error) { setLeads(prevLeads); t.error('Fehler beim Verschieben'); }
      else t.success('Lead als gewonnen markiert');
    } else if (targetColumn === 'rejected') {
      setLeads((prev) =>
        prev.map((l) => l.id === leadId ? { ...l, status: 'lost', column: 'rejected' } : l)
      );
      const { error } = await (supabase.from('leads') as any).update({ status: 'lost' }).eq('id', leadId);
      if (error) { setLeads(prevLeads); t.error('Fehler beim Verschieben'); }
      else t.success('Lead als verloren markiert');
    } else {
      setLeads((prev) =>
        prev.map((l) => l.id === leadId ? { ...l, column: 'anstehend' } : l)
      );
      t.info('Lead verschoben');
    }
  }

  async function handleRescheduleConfirm(reason: string, notes: string) {
    if (!pendingDrop) return;
    const { leadId } = pendingDrop;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const sorted = [...lead.appointments].sort(
      (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
    );
    const latestAppt = sorted[0];
    if (latestAppt) {
      const noteText = `Grund: ${reason}${notes ? `\n${notes}` : ''}`;
      await (supabase.from('appointments') as any)
        .update({ status: 'rescheduled', notes: noteText })
        .eq('id', latestAppt.id);
      setLeads((prev) =>
        prev.map((l) => {
          if (l.id !== leadId) return l;
          const updatedAppointments = l.appointments.map((a) =>
            a.id === latestAppt.id ? { ...a, status: 'rescheduled' as const, notes: noteText } : a
          );
          return { ...l, appointments: updatedAppointments, column: 'neu_terminieren' as KanbanColumn };
        })
      );
    }
    setPendingDrop(null);
  }

  function handleRescheduleCancel() {
    setPendingDrop(null);
  }

  const handleLeadUpdate = useCallback((updated: KanbanLead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelectedLead(updated);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    /* Fixed full-screen container: fills viewport below topbar, right of sidebar */
    <Box
      position="fixed"
      top="var(--nav-height, 64px)"
      left="var(--current-sidebar-width, 240px)"
      right={0}
      bottom={0}
      display="flex"
      flexDirection="column"
      overflow="hidden"
      bg="var(--paper)"
      zIndex={25}
      style={{ transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)' }}
    >
      {/* ── Command Bar (dark) ── */}
      <Box
        bg="var(--forest-deep)"
        px="var(--space-7)"
        pt="var(--space-5)"
        pb="var(--space-5)"
        position="relative"
        overflow="hidden"
        flexShrink={0}
      >
        {/* Subtle texture overlay */}
        <Box
          position="absolute"
          inset={0}
          pointerEvents="none"
          opacity={0.03}
          backgroundImage="url(%22data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E%22)"
        />

        {/* Title row + View switcher */}
        <HStack justify="space-between" align="flex-end" mb="var(--space-4)">
          <Box>
            <Text
              fontFamily="var(--font-mono)"
              fontSize="10px"
              letterSpacing="0.14em"
              textTransform="uppercase"
              color="rgba(252,252,253,0.40)"
              mb="2px"
            >
              — CRM BOARD
            </Text>
            <HStack align="flex-end" spacing="var(--space-4)">
              <Text
                fontFamily="var(--font-display)"
                fontStyle="italic"
                fontSize={{ base: '30px', md: '38px' }}
                lineHeight={0.95}
                letterSpacing="-0.03em"
                color="var(--paper)"
              >
                CRM.
              </Text>
              <Text
                fontFamily="var(--font-mono)"
                fontSize="11px"
                letterSpacing="0.08em"
                textTransform="uppercase"
                color="rgba(252,252,253,0.40)"
                mb="3px"
              >
                {filteredLeads.length !== leads.length
                  ? `${filteredLeads.length} / ${leads.length} Leads`
                  : `${leads.length} Leads`}
              </Text>
            </HStack>
          </Box>

          <HStack spacing="var(--space-3)" align="center">
            {/* View switcher */}
            <HStack
              spacing="2px"
              bg="rgba(252,252,253,0.08)"
              border="1px solid"
              borderColor="rgba(252,252,253,0.12)"
              borderRadius="var(--radius-2)"
              p="3px"
            >
              {VIEW_TABS.map(({ mode, icon, label }) => (
                <Box
                  key={mode}
                  as="button"
                  display="flex"
                  alignItems="center"
                  gap="5px"
                  px="10px"
                  py="5px"
                  borderRadius="var(--radius-1)"
                  bg={viewMode === mode ? 'rgba(252,252,253,0.14)' : 'transparent'}
                  color={viewMode === mode ? 'var(--paper)' : 'rgba(252,252,253,0.45)'}
                  cursor="pointer"
                  fontSize="12px"
                  fontFamily="var(--font-sans)"
                  fontWeight={viewMode === mode ? 600 : 400}
                  border="none"
                  _hover={{ color: 'var(--paper)', bg: 'rgba(252,252,253,0.10)' }}
                  transition="all 150ms ease"
                  onClick={() => setViewMode(mode)}
                >
                  {icon}
                  <Box as="span" display={{ base: 'none', md: 'inline' }}>{label}</Box>
                </Box>
              ))}
            </HStack>

            {/* Bulk toggle */}
            <Box
              as="button"
              display="flex"
              alignItems="center"
              gap="6px"
              px="10px"
              py="6px"
              borderRadius="var(--radius-2)"
              border="1px solid"
              borderColor={bulkMode ? 'var(--leaf)' : 'rgba(252,252,253,0.15)'}
              bg={bulkMode ? 'rgba(74,124,92,0.20)' : 'rgba(252,252,253,0.06)'}
              color={bulkMode ? 'var(--paper)' : 'rgba(252,252,253,0.50)'}
              cursor="pointer"
              fontSize="12px"
              fontFamily="var(--font-sans)"
              fontWeight={bulkMode ? 600 : 400}
              _hover={{ color: 'var(--paper)', borderColor: 'rgba(252,252,253,0.30)' }}
              transition="all 150ms ease"
              onClick={toggleBulkMode}
            >
              {bulkMode ? <CheckSquare size={13} strokeWidth={1.5} /> : <Square size={13} strokeWidth={1.5} />}
              <Box as="span" display={{ base: 'none', md: 'inline' }}>
                {bulkMode ? 'Bulk aktiv' : 'Auswählen'}
              </Box>
            </Box>
          </HStack>
        </HStack>

        {/* Chase trail */}
        <Box position="relative" h="1px" w="100%" overflow="hidden" mb="var(--space-4)" opacity={0.4}>
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(74,124,92,0.8) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
            }}
            initial={{ backgroundPosition: '200% 0' }}
            animate={{ backgroundPosition: '-200% 0' }}
            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </Box>

        {/* Filter bar */}
        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          profiles={profiles}
          allLeads={leads}
        />
      </Box>

      {/* ── CRM Stats ── */}
      <PipelineStats leads={filteredLeads} />

      {/* ── Content Area ── */}
      <Box flex={1} minH={0} overflow="hidden" position="relative">
        <AnimatePresence mode="wait">
          {viewMode === 'kanban' && (
            <motion.div
              key="kanban"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%' }}
            >
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <Box
                  overflowX="auto"
                  overflowY="hidden"
                  h="100%"
                  minH={0}
                  pt="var(--space-5)"
                  pb="var(--space-5)"
                  px="var(--space-7)"
                  sx={{
                    '&::-webkit-scrollbar': { height: '4px' },
                    '&::-webkit-scrollbar-track': { bg: 'var(--frost)' },
                    '&::-webkit-scrollbar-thumb': { bg: 'var(--mist)', borderRadius: 'full' },
                  }}
                >
                  {/* centering wrapper — centers when all columns fit, scrolls when they don't */}
                  <div style={{ display: 'flex', justifyContent: 'center', minWidth: '100%', height: '100%' }}>
                    <motion.div
                      variants={columnStaggerVariants}
                      initial="hidden"
                      animate="visible"
                      style={{
                        display: 'flex',
                        height: '100%',
                        alignItems: 'flex-start',
                      }}
                    >
                      {COLUMN_ORDER.flatMap((col, i) => {
                        const items = [];
                        if (i > 0) {
                          items.push(
                            <div
                              key={`sep-${col}`}
                              style={{
                                width: '1px',
                                background: 'var(--mist)',
                                alignSelf: 'stretch',
                                flexShrink: 0,
                                margin: '0 16px',
                                opacity: 0.8,
                              }}
                            />
                          );
                        }
                        items.push(
                          <motion.div
                            key={col}
                            variants={columnEntryVariants}
                            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                          >
                            <KanbanColumnComponent
                              column={col}
                              leads={grouped[col]}
                              onCardOpen={setSelectedLead}
                              isCollapsed={collapsedColumns.has(col)}
                              onToggleCollapse={() => toggleColumnCollapse(col)}
                              bulkMode={bulkMode}
                              selectedLeads={selectedLeads}
                              onSelectLead={handleSelectLead}
                              onSelectAll={handleSelectAll}
                            />
                          </motion.div>
                        );
                        return items;
                      })}
                    </motion.div>
                  </div>
                </Box>

                <DragOverlay dropAnimation={null}>
                  {activeLead ? <KanbanCard lead={activeLead} onOpen={() => {}} isOverlay /> : null}
                </DragOverlay>
              </DndContext>
            </motion.div>
          )}

          {viewMode === 'list' && (
            <Box key="list-wrapper" h="100%" minH={0} pt="var(--space-5)" px="var(--space-7)" overflowY="auto">
              <ListView
                leads={filteredLeads}
                profiles={profiles}
                onLeadOpen={setSelectedLead}
                bulkMode={bulkMode}
                selectedLeads={selectedLeads}
                onSelectLead={handleSelectLead}
                onSelectAll={handleSelectAllLeads}
              />
            </Box>
          )}

          {viewMode === 'calendar' && (
            <Box key="calendar-wrapper" h="100%" minH={0} pt="var(--space-5)" px="var(--space-7)" overflowY="auto">
              <CalendarView leads={filteredLeads} onLeadOpen={setSelectedLead} />
            </Box>
          )}
        </AnimatePresence>
      </Box>

      {/* ── Bulk Action Bar ── */}
      <AnimatePresence>
        {selectedLeads.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              position: 'fixed',
              bottom: '24px',
              left: 'calc(var(--current-sidebar-width, 240px) / 2 + 50vw)',
              transform: 'translateX(-50%)',
              zIndex: 100,
              minWidth: '480px',
              maxWidth: '700px',
            }}
          >
            <BulkActionBar
              selectedLeads={selectedLeads}
              allLeads={leads}
              profiles={profiles}
              onClearSelection={handleClearSelection}
              onAssign={handleBulkAssign}
              onMove={handleBulkMove}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reschedule Modal ── */}
      <AnimatePresence>
        {pendingDrop && (
          <RescheduleModal
            onConfirm={handleRescheduleConfirm}
            onCancel={handleRescheduleCancel}
          />
        )}
      </AnimatePresence>

      {/* ── Detail Panel ── */}
      <AnimatePresence>
        {selectedLead && (
          <DetailPanel
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onLeadUpdate={handleLeadUpdate}
            userId={userId}
            orgId={orgId}
          />
        )}
      </AnimatePresence>
    </Box>
  );
}
