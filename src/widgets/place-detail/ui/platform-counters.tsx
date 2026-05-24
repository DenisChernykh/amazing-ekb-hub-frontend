import {
  formatMaterialsCount,
  getPlatformDisplay,
  PLACE_PLATFORMS,
  type PlatformCounters as PlatformCountersModel,
} from '@/entities/place';
import { Avatar, Box, Grid, Paper, Stack, Typography } from '@mui/material';

interface PlatformCountersProps {
  counters: PlatformCountersModel;
}

/**
 * Рендерит счетчики материалов по платформам.
 */
export function PlatformCounters({ counters }: Readonly<PlatformCountersProps>) {
  return (
    <Paper
      aria-label="Счетчики материалов по платформам"
      component="section"
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        bgcolor: '#fff',
        border: '1px solid rgba(31, 41, 55, 0.1)',
        borderRadius: 2,
      }}
    >
      <Grid container spacing={1.5}>
        {PLACE_PLATFORMS.map((platform) => {
          const platformDisplay = getPlatformDisplay(platform);
          const count = counters[platform];

          return (
            <Grid key={platform} size={{ xs: 12, sm: 4 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.25}
                sx={{
                  p: 1.5,
                  minHeight: 72,
                  bgcolor: platformDisplay.backgroundColor,
                  borderRadius: 2,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.72)',
                    color: platformDisplay.color,
                    fontWeight: 800,
                  }}
                >
                  {count}
                </Avatar>
                <Box>
                  <Typography color={platformDisplay.color} fontWeight={800}>
                    {platformDisplay.label}
                  </Typography>
                  <Typography color={platformDisplay.color} variant="body2">
                    {formatMaterialsCount(count)}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
}
