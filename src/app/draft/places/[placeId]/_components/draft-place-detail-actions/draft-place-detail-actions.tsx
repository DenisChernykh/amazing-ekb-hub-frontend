import AppLink from '@/shared/ui/app-link';
import { Button, Stack } from '@mui/material';

/**
 * Пропсы action-строки draft detail-экрана.
 */
export interface DraftPlaceDetailActionsProps {
  backHref: string;
  favoriteDisabled: boolean;
}

/**
 * Рендерит верхнюю action-строку draft detail-экрана.
 *
 * @param props - Ссылка назад и состояние favorite action.
 * @returns Action-строку с back и favorite кнопками.
 */
export function DraftPlaceDetailActions({
  backHref,
  favoriteDisabled,
}: Readonly<DraftPlaceDetailActionsProps>) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      justifyContent="space-between"
      alignItems={{ xs: 'stretch', sm: 'center' }}
    >
      <Button component={AppLink} href={backHref} variant="contained">
        Назад к списку
      </Button>

      <Button variant="outlined" disabled={favoriteDisabled}>
        В избранное
      </Button>
    </Stack>
  );
}
