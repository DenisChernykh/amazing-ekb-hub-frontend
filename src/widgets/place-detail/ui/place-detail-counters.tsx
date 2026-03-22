import { MATERIAL_PLATFORMS, getPlatformLabel, type Platform } from '@/entities/material';
import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';

/**
 * Параметры блока счетчиков материалов.
 */
export interface PlaceDetailCountersProps {
  counters: Record<Platform, number>;
}

/**
 * Рендерит grid счетчиков материалов по платформам.
 *
 * @param counters - Счетчики материалов по платформам.
 * @returns MUI-grid с тремя карточками счетчиков.
 */
export function PlaceDetailCounters({ counters }: Readonly<PlaceDetailCountersProps>) {
  return (
    <Grid container spacing={2}>
      {MATERIAL_PLATFORMS.map((platform) => (
        <Grid key={platform} size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="overline">{getPlatformLabel(platform)}</Typography>

                <Typography variant="h4" component="p">
                  {counters[platform]}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
