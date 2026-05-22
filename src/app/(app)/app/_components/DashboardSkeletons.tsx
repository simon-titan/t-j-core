'use client';

import { Box, Grid, Skeleton, SkeletonText, Stack } from '@chakra-ui/react';

export function MetricsRowSkeleton() {
  return (
    <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }} gap={4}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Box
          key={i}
          bg="rgba(248,248,250,0.85)"
          backdropFilter="blur(12px) saturate(1.4)"
          border="1px solid rgba(14,14,12,0.08)"
          borderRadius="xl"
          p={6}
          boxShadow="var(--shadow-cool-2)"
        >
          <Skeleton h="10px" w="60%" mb={3} startColor="var(--mist)" endColor="var(--frost)" />
          <Skeleton h="36px" w="80%" mb={2} startColor="var(--mist)" endColor="var(--frost)" />
          <Skeleton h="12px" w="50%" startColor="var(--mist)" endColor="var(--frost)" />
        </Box>
      ))}
    </Grid>
  );
}

export function SnapshotSkeleton() {
  return (
    <Box bg="var(--frost)" border="1px solid var(--mist)" borderRadius="md" p={6}>
      <Skeleton h="16px" w="40%" mb={5} startColor="var(--mist)" endColor="var(--frost)" />
      <Stack gap={3}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Box key={i} display="flex" gap={3} alignItems="center">
            <Skeleton h="12px" flex={2} startColor="var(--mist)" endColor="var(--frost)" />
            <Skeleton h="12px" flex={1} startColor="var(--mist)" endColor="var(--frost)" />
            <Skeleton h="20px" w="60px" borderRadius="full" startColor="var(--mist)" endColor="var(--frost)" />
            <Skeleton h="12px" flex={1} startColor="var(--mist)" endColor="var(--frost)" />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export function OnboardingProgressSkeleton() {
  return (
    <Box bg="var(--frost)" border="1px solid var(--mist)" borderRadius="md" p={6}>
      <Skeleton h="16px" w="40%" mb={4} startColor="var(--mist)" endColor="var(--frost)" />
      <Skeleton h="8px" w="100%" borderRadius="full" mb={2} startColor="var(--mist)" endColor="var(--frost)" />
      <Skeleton h="12px" w="30%" mb={6} startColor="var(--mist)" endColor="var(--frost)" />
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Box key={i} border="1px solid var(--mist)" borderRadius="md" p={4}>
            <Skeleton h="16px" w="60%" mb={3} startColor="var(--mist)" endColor="var(--frost)" />
            <Skeleton h="4px" w="100%" borderRadius="full" mb={2} startColor="var(--mist)" endColor="var(--frost)" />
            <Skeleton h="12px" w="40%" startColor="var(--mist)" endColor="var(--frost)" />
          </Box>
        ))}
      </Grid>
    </Box>
  );
}

export function TeamTableSkeleton() {
  return (
    <Box bg="var(--frost)" border="1px solid var(--mist)" borderRadius="md" p={6}>
      <Box display="flex" justifyContent="space-between" mb={5}>
        <Skeleton h="16px" w="40%" startColor="var(--mist)" endColor="var(--frost)" />
        <Skeleton h="32px" w="180px" borderRadius="md" startColor="var(--mist)" endColor="var(--frost)" />
      </Box>
      <Stack gap={2}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Box key={i} display="flex" gap={4} py={2} alignItems="center">
            <Skeleton h="12px" flex={2} startColor="var(--mist)" endColor="var(--frost)" />
            <Skeleton h="12px" flex={1} startColor="var(--mist)" endColor="var(--frost)" />
            <Skeleton h="12px" flex={1} startColor="var(--mist)" endColor="var(--frost)" />
            <Skeleton h="12px" flex={1} startColor="var(--mist)" endColor="var(--frost)" />
            <Skeleton h="12px" flex={1} startColor="var(--mist)" endColor="var(--frost)" />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export function NotificationsPreviewSkeleton() {
  return (
    <Box bg="var(--frost)" border="1px solid var(--mist)" borderRadius="md" p={6}>
      <Skeleton h="16px" w="40%" mb={5} startColor="var(--mist)" endColor="var(--frost)" />
      <Stack gap={3}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Box key={i} display="flex" gap={3} alignItems="center">
            <Skeleton boxSize="32px" borderRadius="full" startColor="var(--mist)" endColor="var(--frost)" />
            <Box flex={1}>
              <SkeletonText noOfLines={1} mb={1} startColor="var(--mist)" endColor="var(--frost)" />
              <Skeleton h="10px" w="30%" startColor="var(--mist)" endColor="var(--frost)" />
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
