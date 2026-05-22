'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, HStack, Text, Input, InputGroup, InputLeftElement, Checkbox, VStack } from '@chakra-ui/react';
import { Search, ChevronDown, X, Users, CalendarDays, Building, BarChart2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { FilterState, MeetingType, OrgProfile, KanbanLead } from './types';
import { MEETING_TYPE_LABELS, isFilterActive } from './types';

interface Props {
  filter: FilterState;
  onFilterChange: (f: FilterState) => void;
  profiles: OrgProfile[];
  allLeads: KanbanLead[];
}

const MEETING_TYPE_OPTIONS: MeetingType[] = [
  'discovery', 'demo', 'proposal', 'closing', 'follow_up', 'other',
];

function MultiDropdown<T extends string>({
  label,
  icon,
  options,
  getLabel,
  selected,
  onToggle,
}: {
  label: string;
  icon: React.ReactNode;
  options: T[];
  getLabel: (v: T) => string;
  selected: T[];
  onToggle: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  if (options.length === 0) return null;

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
        borderColor={selected.length > 0 ? 'var(--leaf)' : 'rgba(252,252,253,0.15)'}
        bg={selected.length > 0 ? 'rgba(74,124,92,0.20)' : 'rgba(252,252,253,0.08)'}
        color={selected.length > 0 ? 'var(--paper)' : 'rgba(252,252,253,0.70)'}
        cursor="pointer"
        transition="all 150ms ease"
        onClick={() => setOpen((v) => !v)}
        _hover={{ borderColor: 'rgba(252,252,253,0.30)', color: 'var(--paper)' }}
        whiteSpace="nowrap"
        flexShrink={0}
      >
        {icon}
        <Text fontFamily="var(--font-sans)" fontSize="13px" fontWeight={500}>
          {label}
          {selected.length > 0 && (
            <Box
              as="span"
              ml="6px"
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              bg="var(--leaf)"
              color="var(--paper)"
              borderRadius="full"
              w="16px"
              h="16px"
              fontSize="10px"
              fontWeight={700}
            >
              {selected.length}
            </Box>
          )}
        </Text>
        <ChevronDown
          size={13}
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}
        />
      </Box>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              zIndex: 200,
              minWidth: '200px',
            }}
          >
            <Box
              bg="var(--paper)"
              border="1px solid"
              borderColor="var(--mist)"
              borderRadius="var(--radius-3)"
              boxShadow="var(--shadow-3)"
              overflow="hidden"
            >
              {options.map((opt) => (
                <Box
                  key={opt}
                  px="12px"
                  py="8px"
                  cursor="pointer"
                  display="flex"
                  alignItems="center"
                  gap="10px"
                  bg={selected.includes(opt) ? 'rgba(74,124,92,0.06)' : 'transparent'}
                  _hover={{ bg: 'var(--frost)' }}
                  onClick={() => onToggle(opt)}
                  transition="background 100ms ease"
                >
                  <Checkbox
                    isChecked={selected.includes(opt)}
                    onChange={() => onToggle(opt)}
                    colorScheme="green"
                    size="sm"
                    pointerEvents="none"
                  />
                  <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--ink)">
                    {getLabel(opt)}
                  </Text>
                </Box>
              ))}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

export function FilterBar({ filter, onFilterChange, profiles, allLeads }: Props) {
  const [localSearch, setLocalSearch] = useState(filter.search);

  useEffect(() => {
    const t = setTimeout(() => {
      onFilterChange({ ...filter, search: localSearch });
    }, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  const industries = useMemo(() => {
    const s = new Set<string>();
    allLeads.forEach((l) => { if (l.prospect.industry) s.add(l.prospect.industry); });
    return [...s].sort();
  }, [allLeads]);

  const companySizes = useMemo(() => {
    const s = new Set<string>();
    allLeads.forEach((l) => { if (l.prospect.company_size) s.add(l.prospect.company_size); });
    return [...s].sort();
  }, [allLeads]);

  const assigneeProfiles = useMemo(() => {
    const assignedIds = new Set(allLeads.map((l) => l.assigned_to).filter(Boolean));
    return profiles.filter((p) => assignedIds.has(p.id));
  }, [profiles, allLeads]);

  const toggle = useCallback(
    <T extends string>(key: keyof FilterState, val: T) => {
      const arr = filter[key] as T[];
      onFilterChange({
        ...filter,
        [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val],
      });
    },
    [filter, onFilterChange]
  );

  const active = isFilterActive(filter);

  return (
    <Box>
      <HStack spacing="var(--space-3)" flexWrap="nowrap" overflowX="auto">
        {/* Search */}
        <Box flex={1} minW="180px" maxW="320px">
          <InputGroup size="sm">
            <InputLeftElement pointerEvents="none" h="100%" pl="10px">
              <Search size={14} color="rgba(252,252,253,0.45)" />
            </InputLeftElement>
            <Input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Name oder Firma suchen…"
              bg="rgba(252,252,253,0.08)"
              border="1px solid"
              borderColor="rgba(252,252,253,0.15)"
              borderRadius="var(--radius-2)"
              color="var(--paper)"
              h="34px"
              fontSize="13px"
              fontFamily="var(--font-sans)"
              pl="34px"
              _placeholder={{ color: 'rgba(252,252,253,0.40)' }}
              _focus={{
                borderColor: 'var(--leaf)',
                boxShadow: '0 0 0 3px rgba(74,124,92,0.20)',
                bg: 'rgba(252,252,253,0.12)',
              }}
              _hover={{ borderColor: 'rgba(252,252,253,0.25)' }}
            />
          </InputGroup>
        </Box>

        {/* Assignee — only for multi-member orgs */}
        {profiles.length > 1 && (
          <MultiDropdown
            label="Assignee"
            icon={<Users size={13} />}
            options={assigneeProfiles.map((p) => p.id)}
            getLabel={(id) => assigneeProfiles.find((p) => p.id === id)?.full_name ?? id}
            selected={filter.assignees}
            onToggle={(v) => toggle('assignees', v)}
          />
        )}

        {/* Meeting-Typ */}
        <MultiDropdown
          label="Meeting-Typ"
          icon={<CalendarDays size={13} />}
          options={MEETING_TYPE_OPTIONS}
          getLabel={(v) => MEETING_TYPE_LABELS[v]}
          selected={filter.meetingTypes}
          onToggle={(v) => toggle('meetingTypes', v)}
        />

        {/* Branche */}
        <MultiDropdown
          label="Branche"
          icon={<Building size={13} />}
          options={industries}
          getLabel={(v) => v}
          selected={filter.industries}
          onToggle={(v) => toggle('industries', v)}
        />

        {/* Firmengröße */}
        <MultiDropdown
          label="Firmengröße"
          icon={<BarChart2 size={13} />}
          options={companySizes}
          getLabel={(v) => v}
          selected={filter.companySizes}
          onToggle={(v) => toggle('companySizes', v)}
        />

        {/* Clear */}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Box
                as="button"
                display="flex"
                alignItems="center"
                gap="5px"
                px="10px"
                py="7px"
                borderRadius="var(--radius-2)"
                border="1px solid"
                borderColor="rgba(252,252,253,0.20)"
                color="rgba(252,252,253,0.60)"
                bg="transparent"
                cursor="pointer"
                fontSize="12px"
                fontFamily="var(--font-sans)"
                flexShrink={0}
                _hover={{ color: 'var(--paper)', borderColor: 'rgba(252,252,253,0.40)' }}
                transition="all 150ms ease"
                onClick={() => {
                  setLocalSearch('');
                  onFilterChange({ search: '', assignees: [], meetingTypes: [], industries: [], companySizes: [] });
                }}
              >
                <X size={12} />
                Löschen
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </HStack>
    </Box>
  );
}
