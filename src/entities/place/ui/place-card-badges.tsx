import { Avatar, Chip, Stack } from '@mui/material';
import { getPlatformDisplay, getVisiblePlatformCounters } from '../model/place-display';
import type { PlaceCardModel } from '../model/types';

interface PlaceCardBadgesProps {
  place: PlaceCardModel;
}

/**
 * Рендерит категорию и platform/count бейджи карточки.
 *
 * @param props - Данные карточки места.
 */
export function PlaceCardBadges({ place }: Readonly<PlaceCardBadgesProps>) {
  const platformCounters = getVisiblePlatformCounters(place.platformCounters);

  return (
    <Stack
      aria-label="Категория и материалы"
      component="div"
      direction="row"
      flexWrap="wrap"
      gap={0.75}
      minHeight={28}
    >
      {platformCounters.map(({ platform, count }) => {
        const platformDisplay = getPlatformDisplay(platform);

        return (
          <Chip
            avatar={
              <Avatar
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.72)',
                  color: platformDisplay.color,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                }}
              >
                {count}
              </Avatar>
            }
            key={platform}
            label={platformDisplay.label}
            size="small"
            sx={{
              bgcolor: platformDisplay.backgroundColor,
              color: platformDisplay.color,
              fontWeight: 700,
              '& .MuiChip-avatar': {
                ml: 0.5,
              },
            }}
          />
        );
      })}
    </Stack>
  );
}
