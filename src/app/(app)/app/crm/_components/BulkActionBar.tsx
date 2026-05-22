'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, Text, HStack } from '@chakra-ui/react';
import { X, Download, UserCheck, ArrowRight, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { KanbanLead, KanbanColumn, OrgProfile } from './types';
import { COLUMN_CONFIG, COLUMN_ORDER } from './types';
import { getLeadDealValue } from './types';

interface Props {
  selectedLeads: Set<string>;
  allLeads: KanbanLead[];
  profiles: OrgProfile[];
  onClearSelection: () => void;
  onAssign: (leadIds: string[], profileId: string) => void;
  onMove: (leadIds: string[], column: KanbanColumn) => void;
}

function ActionDropdown({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <Box ref={ref} position="relative">
      <Box
        as="button"
        display="flex"
        alignItems="center"
        gap="6px"
        px="12px"
        py="7px"
        borderRadius="var(--radius-2)"
        border="1px solid"
        borderColor="rgba(252,252,253,0.20)"
        bg="rgba(252,252,253,0.08)"
        color="rgba(252,252,253,0.85)"
        cursor="pointer"
        fontSize="13px"
        fontFamily="var(--font-sans)"
        fontWeight={500}
        _hover={{ bg: 'rgba(252,252,253,0.14)', color: 'var(--paper)' }}
        transition="all 150ms ease"
        onClick={() => setOpen((v) => !v)}
      >
        {icon}
        {label}
        <ChevronDown
          size={12}
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}
        />
      </Box>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: 0,
              zIndex: 300,
              minWidth: '180px',
            }}
          >
            <Box
              bg="var(--paper)"
              border="1px solid"
              borderColor="var(--mist)"
              borderRadius="var(--radius-3)"
              boxShadow="var(--shadow-3)"
              overflow="hidden"
              onClick={() => setOpen(false)}
            >
              {children}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

function DropItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Box
      px="12px"
      py="8px"
      cursor="pointer"
      _hover={{ bg: 'var(--frost)' }}
      onClick={onClick}
      transition="background 100ms ease"
    >
      <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--ink)">
        {label}
      </Text>
    </Box>
  );
}

export function BulkActionBar({
  selectedLeads,
  allLeads,
  profiles,
  onClearSelection,
  onAssign,
  onMove,
}: Props) {
  const ids = [...selectedLeads];
  const count = ids.length;

  const totalValue = allLeads
    .filter((l) => selectedLeads.has(l.id))
    .reduce((s, l) => s + getLeadDealValue(l), 0);

  function handleExport() {
    const selected = allLeads.filter((l) => selectedLeads.has(l.id));
    const header = ['Name', 'Firma', 'Email', 'Status', 'Deal-Wert (€)', 'Assignee'];
    const rows = selected.map((l) => {
      const assigneeName = profiles.find((p) => p.id === l.assigned_to)?.full_name ?? '';
      return [
        `${l.prospect.first_name} ${l.prospect.last_name}`,
        l.prospect.company ?? '',
        l.prospect.email ?? '',
        l.status,
        getLeadDealValue(l).toString(),
        assigneeName,
      ];
    });
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const movableColumns = COLUMN_ORDER.filter(
    (c) => COLUMN_CONFIG[c].acceptsDrop && c !== 'neu_terminieren'
  );

  return (
    <Box
      bg="var(--forest-deep)"
      borderRadius="var(--radius-4)"
      border="1px solid"
      borderColor="rgba(252,252,253,0.12)"
      boxShadow="var(--shadow-4)"
      px="var(--space-5)"
      py="var(--space-3)"
    >
      <HStack spacing="var(--space-4)" flexWrap="nowrap">
        {/* Clear */}
        <Box
          as="button"
          display="flex"
          alignItems="center"
          gap="5px"
          color="rgba(252,252,253,0.55)"
          cursor="pointer"
          fontSize="13px"
          fontFamily="var(--font-sans)"
          bg="transparent"
          border="none"
          p={0}
          _hover={{ color: 'var(--paper)' }}
          transition="color 150ms ease"
          onClick={onClearSelection}
          flexShrink={0}
        >
          <X size={14} />
        </Box>

        {/* Count */}
        <HStack spacing="var(--space-2)" flexShrink={0}>
          <Text
            fontFamily="var(--font-display)"
            fontStyle="italic"
            fontSize="20px"
            fontWeight={600}
            color="var(--paper)"
            lineHeight={1}
          >
            {count}
          </Text>
          <Text fontFamily="var(--font-sans)" fontSize="13px" color="rgba(252,252,253,0.60)">
            {count === 1 ? 'Lead' : 'Leads'} ausgewählt
            {totalValue > 0 && (
              <Box as="span" ml="6px" color="var(--leaf)">
                · €{totalValue.toLocaleString('de-DE')}
              </Box>
            )}
          </Text>
        </HStack>

        <Box flex={1} />

        {/* Assign */}
        {profiles.length > 0 && (
          <ActionDropdown label="Zuweisen" icon={<UserCheck size={13} />}>
            {profiles.map((p) => (
              <DropItem
                key={p.id}
                label={p.full_name ?? p.id}
                onClick={() => onAssign(ids, p.id)}
              />
            ))}
          </ActionDropdown>
        )}

        {/* Move */}
        <ActionDropdown label="Verschieben" icon={<ArrowRight size={13} />}>
          {movableColumns.map((col) => (
            <DropItem
              key={col}
              label={COLUMN_CONFIG[col].label}
              onClick={() => onMove(ids, col)}
            />
          ))}
        </ActionDropdown>

        {/* Export */}
        <Box
          as="button"
          display="flex"
          alignItems="center"
          gap="6px"
          px="12px"
          py="7px"
          borderRadius="var(--radius-2)"
          border="1px solid"
          borderColor="rgba(252,252,253,0.20)"
          bg="rgba(252,252,253,0.08)"
          color="rgba(252,252,253,0.85)"
          cursor="pointer"
          fontSize="13px"
          fontFamily="var(--font-sans)"
          fontWeight={500}
          _hover={{ bg: 'rgba(252,252,253,0.14)', color: 'var(--paper)' }}
          transition="all 150ms ease"
          onClick={handleExport}
        >
          <Download size={13} />
          CSV Export
        </Box>
      </HStack>
    </Box>
  );
}
