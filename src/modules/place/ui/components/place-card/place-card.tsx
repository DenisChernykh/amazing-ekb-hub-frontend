import { Card } from '@mui/material';
import type { PlaceCardViewModel } from '../../view-model';
import { PlaceCardActions } from './place-card-actions';
import { PlaceCardBody } from './place-card-body';
import { PlaceCardMedia } from './place-card-media';

/**
 * Параметры презентационной карточки места.
 */
export interface PlaceCardProps {
  place: PlaceCardViewModel;
}

/**
 * Рендерит одну карточку места в home-ленте.
 *
 * @param place - Готовая view model карточки.
 * @returns Презентационную карточку с тегами и ссылкой на detail route.
 */
export function PlaceCard({ place }: Readonly<PlaceCardProps>) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <PlaceCardMedia place={place} />
      <PlaceCardBody place={place} />
      <PlaceCardActions href={place.href} />
    </Card>
  );
}
