import type { PlaceCardViewModel } from '@/modules/place/ui/view-model';
import { CardContent, Stack, Typography } from '@mui/material';
import { PlaceCardTags } from './place-card-tags';

/**
 * Пропсы body-секции карточки места.
 */
export interface PlaceCardBodyProps {
  place: PlaceCardViewModel;
}

/**
 * Рендерит основное содержимое карточки места.
 *
 * @param props - Готовая view model карточки.
 * @returns Body-блок карточки.
 */
export function PlaceCardBody({ place }: Readonly<PlaceCardBodyProps>) {
  return (
    <CardContent>
      <Stack spacing={2}>
        <Typography variant="h5" component="h3">
          {place.title}
        </Typography>

        <Typography variant="body2">{place.summary}</Typography>

        <PlaceCardTags tags={place.tags} />
      </Stack>
    </CardContent>
  );
}
