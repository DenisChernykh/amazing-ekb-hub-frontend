import { Box, Container, Paper, Skeleton, Stack } from '@mui/material';
import { PlaceFeedSkeleton } from '../../components/place-feed-skeleton';

/**
 * Route-level loading для home-сценариев списка мест.
 */
export function PlaceFeedScreenLoading() {
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
