import AppLink from '@/shared/ui/app-link';
import { Button, CardActions } from '@mui/material';

/**
 * Пропсы action-секции карточки места.
 */
export interface PlaceCardActionsProps {
  href: string;
}

/**
 * Рендерит CTA-блок карточки места.
 *
 * @param props - Ссылка на detail-страницу места.
 * @returns Action-блок карточки.
 */
export function PlaceCardActions({ href }: Readonly<PlaceCardActionsProps>) {
  return (
    <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
      <Button component={AppLink} href={href} variant="contained">
        Открыть место
      </Button>
    </CardActions>
  );
}
