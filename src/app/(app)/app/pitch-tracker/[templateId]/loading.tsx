import { Box } from '@chakra-ui/react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <Box>
      <Box h="60px" mb={6} display="flex" alignItems="flex-end">
        <Box w="240px" h="44px" bg="var(--mist)" borderRadius="var(--radius-2)" style={{ opacity: 0.5 }} />
      </Box>
      <Skeleton shape="table-row" count={8} />
    </Box>
  );
}
