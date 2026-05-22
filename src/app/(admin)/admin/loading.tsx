import { Box } from '@chakra-ui/react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <Box maxW="var(--admin-max-width)" mx="auto">
      <Box mb={8}>
        <Skeleton shape="stat-card" count={4} />
      </Box>
      <Skeleton shape="table-row" count={5} />
    </Box>
  );
}
