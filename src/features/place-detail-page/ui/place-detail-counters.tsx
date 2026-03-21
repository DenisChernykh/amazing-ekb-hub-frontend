import { Platform } from '@/entities/place';
import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';

/**
 * Параметры блока счетчиков материалов.
 */
export interface PlaceDetailCountersProps {
  counters: Record<Platform, number>;
}

const PLATFORM_ORDER: readonly Platform[] = ['dzen', 'telegram', 'instagram'];

const PLATFORM_LABELS: Record<Platform, string> = {
  dzen: 'Dzen',
  telegram: 'Telegram',
  instagram: 'Instagram',
};

/**
 * Рендерит grid счетчиков материалов по платформам.
 *
 * @param counters - Счетчики материалов по платформам.
 * @returns MUI-grid с тремя карточками счетчиков.
 */
export function PlaceDetailCounters({ counters }: Readonly<PlaceDetailCountersProps>) {
  <Grid container spacing={2}>
    {PLATFORM_ORDER.map((platform) => (
      <Grid key={platform} size={{ xs: 12, sm: 4 }}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="overline">{PLATFORM_LABELS[platform]}</Typography>

              <Typography variant="h4" component="p">
                {counters[platform]}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>;
}
