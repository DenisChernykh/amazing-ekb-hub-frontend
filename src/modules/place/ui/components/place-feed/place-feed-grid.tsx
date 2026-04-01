import { Grid } from '@mui/material';
import type { PlaceCardViewModel } from '../../view-model';
import { PlaceCard } from '../place-card';

/**
 * Пропсы grid-части ленты мест.
 */
export interface PlaceFeedGridProps {
  items: readonly PlaceCardViewModel[];
}

/**
 * Рендерит grid карточек мест.
 *
 * @param props - Список карточек для отображения.
 * @returns Grid ленты мест.
 */
export function PlaceFeedGrid({ items }: Readonly<PlaceFeedGridProps>) {
  return (
    <Grid container spacing={3}>
      {items.map((place) => (
        <Grid key={place.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <PlaceCard place={place} />
        </Grid>
      ))}
    </Grid>
  );
}
