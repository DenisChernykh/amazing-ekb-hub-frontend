import { PlaceFeedSkeleton } from '@/features/place-feed';
import { Box, Container, Paper, Skeleton, Stack } from '@mui/material';

/**
 * Route-level loading для главного дерева приложения.
 *
 * @returns Skeleton intro-блока и списка мест.
 */
export default function Loading() {
  return (
    <Box component="main" sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: { xs: 4, md: 6 } }}>
            <Stack spacing={2}>
              <Skeleton variant="text" width="20%" height={24} />
              <Skeleton variant="text" width="55%" height={64} />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="72%" />
            </Stack>
          </Paper>

          <PlaceFeedSkeleton />
        </Stack>
      </Container>
    </Box>
  );
}
