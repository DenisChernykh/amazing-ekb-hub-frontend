import { getPlatformLabel, MATERIAL_PLATFORMS, type Platform } from '@/modules/material';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import type { PlaceDetailCountersViewModel } from '../../view-model';

/**
 * Параметры блока счетчиков detail-экрана.
 */
export interface PlaceDetailCountersProps {
  counters: PlaceDetailCountersViewModel;
}

/**
 * Рендерит счетчики материалов по платформам.
 *
 * @param counters - Количество материалов по платформам.
 * @returns MUI-блок со счетчиками detail-экрана.
 */
export function PlaceDetailCounters({ counters }: Readonly<PlaceDetailCountersProps>) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {MATERIAL_PLATFORMS.map((platform) => (
            <CounterItem key={platform} platform={platform} count={counters[platform]} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

interface CounterItemProps {
  platform: Platform;
  count: number;
}

/**
 * Рендерит один счетчик платформы.
 *
 * @param props - Платформа и количество материалов.
 * @returns Один counter item.
 */
function CounterItem({ platform, count }: Readonly<CounterItemProps>) {
  return (
    <Box
      sx={{
        flex: 1,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Stack spacing={0.5}>
        <Typography variant="overline" color="text.secondary">
          {getPlatformLabel(platform)}
        </Typography>

        <Typography variant="h5" component="p">
          {count}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          материалов
        </Typography>
      </Stack>
    </Box>
  );
}
