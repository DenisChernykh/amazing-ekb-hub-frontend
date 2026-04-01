import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { PlaceDetailPinnedCardViewModel } from '../../view-model';

interface PlaceDetailPinnedCardEmptyStateProps {
  pinned: Extract<PlaceDetailPinnedCardViewModel, { kind: 'empty' }>;
}

/**
 * Рендерит empty-state закрепленного материала.
 *
 * @param pinned - Empty view model pinned-блока.
 * @returns Пустое состояние pinned-card.
 */
export function PlaceDetailPinnedCardEmptyState({
  pinned,
}: Readonly<PlaceDetailPinnedCardEmptyStateProps>) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="h6" component="h2">
            {pinned.title}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {pinned.description}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
