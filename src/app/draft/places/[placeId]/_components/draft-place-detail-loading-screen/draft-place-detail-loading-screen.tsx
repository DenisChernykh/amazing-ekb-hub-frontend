import { Box, Container, Grid, Paper, Skeleton, Stack } from '@mui/material';

/**
 * Route-level loading для draft detail-страницы места.
 */
export function DraftPlaceDetailLoadingScreen() {
  return (
    <Box component="main" sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
            <Skeleton variant="rounded" width={180} height={40} />
            <Skeleton variant="rounded" width={160} height={40} />
          </Stack>

          <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2}>
              <Skeleton variant="rounded" width={120} height={28} />
              <Skeleton variant="text" width="48%" height={56} />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="78%" />
              <Stack direction="row" spacing={1}>
                <Skeleton variant="rounded" width={88} height={28} />
                <Skeleton variant="rounded" width={96} height={28} />
                <Skeleton variant="rounded" width={84} height={28} />
              </Stack>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
            <Grid container spacing={2}>
              {Array.from({ length: 3 }, (_, index) => (
                <Grid key={`counter-${index}`} size={{ xs: 12, sm: 4 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      <Skeleton variant="text" width="50%" />
                      <Skeleton variant="text" width="30%" height={40} />
                      <Skeleton variant="text" width="60%" />
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2}>
              <Skeleton variant="text" width="24%" />
              <Skeleton variant="text" width="56%" height={36} />
              <Stack direction="row" spacing={1}>
                <Skeleton variant="rounded" width={96} height={28} />
                <Skeleton variant="rounded" width={104} height={28} />
                <Skeleton variant="rounded" width={88} height={28} />
              </Stack>
              <Skeleton variant="rounded" width={180} height={40} />
            </Stack>
          </Paper>

          {Array.from({ length: 3 }, (_, index) => (
            <Paper key={`section-${index}`} variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  justifyContent="space-between"
                >
                  <Skeleton variant="text" width="30%" height={36} />
                  <Skeleton variant="text" width="18%" />
                </Stack>

                <Skeleton variant="text" width="92%" />
                <Skeleton variant="text" width="75%" />
                <Skeleton variant="text" width="84%" />
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
