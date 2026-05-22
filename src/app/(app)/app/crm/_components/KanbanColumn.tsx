'use client';

import { Box, Text, HStack, Checkbox } from '@chakra-ui/react';
import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Euro } from 'lucide-react';
import type { KanbanColumn as KanbanColumnType, KanbanLead } from './types';
import { COLUMN_CONFIG, getLeadDealValue } from './types';
import { KanbanCard } from './KanbanCard';

const MotionBox = motion(Box);

const HEADER_STYLES: Record<
  KanbanColumnType,
  { bg: string; color: string; kickerColor: string; dotColor?: string }
> = {
  anstehend: { bg: 'var(--frost)', color: 'var(--ink)', kickerColor: 'var(--mute)' },
  heute_fällig: {
    bg: 'linear-gradient(135deg, #0E0E0C 0%, #122620 100%)',
    color: 'var(--paper)',
    kickerColor: 'rgba(252,252,253,0.50)',
    dotColor: 'var(--leaf)',
  },
  neu_terminieren: {
    bg: 'rgba(234,179,8,0.08)',
    color: '#854D0E',
    kickerColor: 'rgba(133,77,14,0.55)',
  },
  closed: {
    bg: 'rgba(74,124,92,0.08)',
    color: 'var(--forest)',
    kickerColor: 'rgba(31,58,46,0.50)',
  },
  rejected: {
    bg: 'linear-gradient(135deg, rgba(239,68,68,0.07) 0%, rgba(239,68,68,0.03) 100%)',
    color: '#991B1B',
    kickerColor: 'rgba(153,27,27,0.50)',
    dotColor: '#EF4444',
  },
};

const cardContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.65, 0, 0.35, 1] } },
};

interface Props {
  column: KanbanColumnType;
  leads: KanbanLead[];
  onCardOpen: (lead: KanbanLead) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  bulkMode: boolean;
  selectedLeads: Set<string>;
  onSelectLead: (id: string, selected: boolean) => void;
  onSelectAll: (column: KanbanColumnType, selected: boolean) => void;
}

export function KanbanColumn({
  column,
  leads,
  onCardOpen,
  isCollapsed,
  onToggleCollapse,
  bulkMode,
  selectedLeads,
  onSelectLead,
  onSelectAll,
}: Props) {
  const config = COLUMN_CONFIG[column];
  const headerStyles = HEADER_STYLES[column];
  const { setNodeRef, isOver } = useDroppable({ id: column, disabled: !config.acceptsDrop });

  const isHeuteFällig = column === 'heute_fällig';
  const totalDealValue = leads.reduce((s, l) => s + getLeadDealValue(l), 0);
  const allSelected = leads.length > 0 && leads.every((l) => selectedLeads.has(l.id));
  const someSelected = leads.some((l) => selectedLeads.has(l.id));

  const showDealTotal = totalDealValue > 0 && (column === 'anstehend' || column === 'heute_fällig' || column === 'closed');

  const formatMini = (v: number) =>
    v >= 1000 ? `€${(v / 1000).toFixed(0)}k` : `€${v}`;

  return (
    <MotionBox
      animate={{ width: isCollapsed ? '48px' : '300px' }}
      transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
      style={{ flexShrink: 0 }}
      display="flex"
      flexDirection="column"
      h="100%"
      overflow="hidden"
    >
      {/* Collapsed strip */}
      {isCollapsed ? (
        <Box
          h="100%"
          display="flex"
          flexDirection="column"
          alignItems="center"
          pt="var(--space-3)"
          gap="var(--space-4)"
          cursor="pointer"
          onClick={onToggleCollapse}
        >
          <Box
            bg={headerStyles.bg}
            borderRadius="var(--radius-3)"
            w="36px"
            py="var(--space-4)"
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap="var(--space-3)"
          >
            <Box
              color={headerStyles.color}
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              <Text
                fontFamily="var(--font-sans)"
                fontSize="11px"
                fontWeight={600}
                letterSpacing="0.04em"
                whiteSpace="nowrap"
              >
                {config.label}
              </Text>
            </Box>
            <Box
              bg={isHeuteFällig ? 'rgba(252,252,253,0.15)' : 'rgba(14,14,12,0.08)'}
              color={isHeuteFällig ? 'var(--paper)' : 'var(--mute)'}
              borderRadius="var(--radius-full)"
              px="6px"
              py="1px"
              fontFamily="var(--font-mono)"
              fontSize="10px"
              minW="20px"
              textAlign="center"
            >
              {leads.length}
            </Box>
          </Box>
        </Box>
      ) : (
        <>
          {/* Column Header */}
          <Box
            background={headerStyles.bg}
            borderRadius="var(--radius-4)"
            border="1px solid"
            borderColor={column === 'rejected' ? 'rgba(239,68,68,0.18)' : 'transparent'}
            px="var(--space-4)"
            py="var(--space-3)"
            mb="var(--space-3)"
            position="relative"
            overflow="hidden"
          >
            {/* Glowing dot for heute_fällig / rejected */}
            {headerStyles.dotColor && (
              <Box
                position="absolute"
                top="var(--space-3)"
                right="44px"
                w="7px"
                h="7px"
                borderRadius="full"
                bg={headerStyles.dotColor}
                boxShadow={`0 0 8px ${headerStyles.dotColor}`}
              />
            )}

            {/* Kicker */}
            <Text
              fontFamily="var(--font-mono)"
              fontSize="9px"
              letterSpacing="0.14em"
              textTransform="uppercase"
              color={headerStyles.kickerColor}
              mb="2px"
            >
              — {config.description}
            </Text>

            {/* Title row */}
            <HStack justify="space-between" align="center">
              <HStack spacing="var(--space-2)" align="center" flex={1} minW={0}>
                {/* Bulk checkbox */}
                {bulkMode && (
                  <Checkbox
                    isChecked={allSelected}
                    isIndeterminate={someSelected && !allSelected}
                    onChange={(e) => onSelectAll(column, e.target.checked)}
                    colorScheme="green"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                <Text
                  fontFamily="var(--font-sans)"
                  fontSize="14px"
                  fontWeight={700}
                  color={headerStyles.color}
                  letterSpacing="-0.01em"
                  noOfLines={1}
                >
                  {config.label}
                </Text>
              </HStack>

              <HStack spacing="var(--space-2)" flexShrink={0}>
                {/* Deal total */}
                {showDealTotal && (
                  <HStack spacing="2px" opacity={0.75}>
                    <Euro size={9} color={isHeuteFällig ? 'var(--paper)' : headerStyles.color} />
                    <Text
                      fontFamily="var(--font-mono)"
                      fontSize="10px"
                      color={isHeuteFällig ? 'rgba(252,252,253,0.70)' : headerStyles.kickerColor}
                    >
                      {formatMini(totalDealValue)}
                    </Text>
                  </HStack>
                )}

                {/* Count badge */}
                <Box
                  bg={isHeuteFällig ? 'rgba(252,252,253,0.15)' : 'rgba(14,14,12,0.08)'}
                  color={isHeuteFällig ? 'var(--paper)' : 'var(--mute)'}
                  borderRadius="var(--radius-full)"
                  px="7px"
                  py="1px"
                  fontFamily="var(--font-mono)"
                  fontSize="11px"
                  minW="22px"
                  textAlign="center"
                >
                  {leads.length}
                </Box>

                {/* Collapse toggle */}
                <Box
                  as="button"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  w="22px"
                  h="22px"
                  borderRadius="var(--radius-2)"
                  color={isHeuteFällig ? 'rgba(252,252,253,0.50)' : 'var(--mute)'}
                  bg="transparent"
                  cursor="pointer"
                  _hover={{
                    bg: isHeuteFällig ? 'rgba(252,252,253,0.10)' : 'rgba(14,14,12,0.06)',
                    color: isHeuteFällig ? 'var(--paper)' : 'var(--ink)',
                  }}
                  transition="all 150ms ease"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onToggleCollapse();
                  }}
                  title="Spalte einklappen"
                >
                  <ChevronLeft size={13} strokeWidth={2} />
                </Box>
              </HStack>
            </HStack>
          </Box>

          {/* Drop Zone */}
          <Box
            ref={setNodeRef}
            flex={1}
            minH="120px"
            borderRadius="var(--radius-3)"
            border="2px dashed"
            borderColor={isOver && config.acceptsDrop ? 'var(--forest)' : 'transparent'}
            bg={isOver && config.acceptsDrop ? 'rgba(74,124,92,0.04)' : 'transparent'}
            transition="border-color 150ms ease, background 150ms ease"
            p="2px"
          >
            <motion.div
              variants={cardContainerVariants}
              initial="hidden"
              animate="visible"
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <AnimatePresence mode="popLayout">
                {leads.map((lead) => (
                  <motion.div
                    key={lead.id}
                    layout
                    variants={cardVariants}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  >
                    <KanbanCard
                      lead={lead}
                      onOpen={onCardOpen}
                      bulkMode={bulkMode}
                      isSelected={selectedLeads.has(lead.id)}
                      onSelect={onSelectLead}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {leads.length === 0 && (
                <Box py="var(--space-8)" textAlign="center">
                  <Text
                    fontFamily="var(--font-mono)"
                    fontSize="10px"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color="var(--mist)"
                  >
                    Leer
                  </Text>
                </Box>
              )}
            </motion.div>
          </Box>
        </>
      )}
    </MotionBox>
  );
}
