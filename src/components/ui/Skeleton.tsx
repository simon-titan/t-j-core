'use client';

import { Box } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const shimmer = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: { duration: 1.8, ease: 'linear' as const, repeat: Infinity },
  },
};

const skeletonStyle = {
  background: 'linear-gradient(90deg, #EEEEF1 0%, #F8F8FA 50%, #EEEEF1 100%)',
  backgroundSize: '200% 100%',
  borderRadius: '4px',
};

function Bar({ h = '14px', w = '100%', mb = 0 }: { h?: string; w?: string; mb?: number }) {
  return (
    <motion.div
      variants={shimmer}
      initial="initial"
      animate="animate"
      style={{ ...skeletonStyle, height: h, width: w, marginBottom: mb }}
    />
  );
}

function StatCard() {
  return (
    <Box bg="var(--frost)" border="1px solid var(--mist)" borderRadius="var(--radius-3)" p={5} display="flex" flexDirection="column" gap={4}>
      <Bar h="10px" w="60%" />
      <Bar h="28px" w="40%" />
    </Box>
  );
}

function TableRow() {
  return (
    <Box display="grid" gridTemplateColumns="80px 1fr 120px 80px 40px" gap={4} px={3} py={3} borderBottom="1px solid var(--mist)" alignItems="center">
      <Bar h="12px" />
      <Bar h="12px" w="70%" />
      <Bar h="12px" w="80%" />
      <Bar h="12px" />
      <Bar h="12px" w="24px" />
    </Box>
  );
}

function KanbanCard() {
  return (
    <Box bg="var(--paper)" border="1px solid var(--mist)" borderRadius="var(--radius-3)" p={4} display="flex" flexDirection="column" gap={3} w="260px">
      <Bar h="12px" w="50%" />
      <Bar h="14px" w="80%" />
      <Bar h="12px" w="60%" />
      <Box display="flex" gap={2} mt={1}>
        <Bar h="20px" w="60px" />
        <Bar h="20px" w="80px" />
      </Box>
    </Box>
  );
}

type Shape = 'stat-card' | 'table-row' | 'kanban-card' | 'line';

interface Props {
  shape: Shape;
  count?: number;
}

export function Skeleton({ shape, count = 1 }: Props) {
  const items = Array.from({ length: count });

  if (shape === 'stat-card') {
    return (
      <Box display="grid" gridTemplateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={4}>
        {items.map((_, i) => <StatCard key={i} />)}
      </Box>
    );
  }

  if (shape === 'table-row') {
    return (
      <Box border="1px solid var(--mist)" borderRadius="var(--radius-4)" overflow="hidden">
        <Box px={3} h="40px" bg="var(--frost)" borderBottom="1px solid var(--mist)" display="flex" alignItems="center">
          <Bar h="10px" w="30%" />
        </Box>
        {items.map((_, i) => <TableRow key={i} />)}
      </Box>
    );
  }

  if (shape === 'kanban-card') {
    return (
      <Box display="flex" gap={6} overflowX="hidden">
        {items.map((_, i) => (
          <Box key={i} display="flex" flexDirection="column" gap={3}>
            <Bar h="12px" w="80px" />
            {[1, 2, 3].map(j => <KanbanCard key={j} />)}
          </Box>
        ))}
      </Box>
    );
  }

  return <Bar h="14px" />;
}
