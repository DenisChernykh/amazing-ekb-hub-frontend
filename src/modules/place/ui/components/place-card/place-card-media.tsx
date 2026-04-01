import { Box, Chip, Stack, Typography } from '@mui/material';
import { PLACE_FEED_CATEGORY_BACKGROUND, PLACE_FEED_CATEGORY_CHIP_COLOR } from '../../config';
import type { PlaceCardViewModel } from '../../view-model';

/**
 * Пропсы верхней tonal/media зоны карточки места.
 */
export interface PlaceCardMediaProps {
  place: PlaceCardViewModel;
}

/**
 * Рендерит верхнюю tonal/media секцию карточки места.
 *
 * @param props - Готовая view model карточки.
 * @returns Верхний визуальный блок карточки.
 */
export function PlaceCardMedia({ place }: Readonly<PlaceCardMediaProps>) {
  return (
    <Box
      sx={{
        minHeight: 168,
        px: 2.5,
        py: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 2,
        background: PLACE_FEED_CATEGORY_BACKGROUND[place.category],
      }}
    >
      <Typography variant="overline">Стрельчук в Екатеринбурге</Typography>

      <Stack spacing={1}>
        <Chip
          label={place.categoryLabel}
          size="small"
          color={PLACE_FEED_CATEGORY_CHIP_COLOR[place.category]}
          sx={{ alignSelf: 'flex-start' }}
        />

        {place.tags.length > 0 ? (
          <Typography variant="body2">{place.tags.slice(0, 2).join(' · ')}</Typography>
        ) : null}
      </Stack>
    </Box>
  );
}
