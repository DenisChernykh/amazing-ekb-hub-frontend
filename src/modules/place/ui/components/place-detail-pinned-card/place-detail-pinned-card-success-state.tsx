import AppLink from '@/shared/ui/app-link';
import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import type { PlaceDetailPinnedCardViewModel } from '../../view-model';
import { PlaceDetailPinnedCardMetaChips } from './place-detail-pinned-card-meta-chips';

interface PlaceDetailPinnedCardSuccessStateProps {
  pinned: Extract<PlaceDetailPinnedCardViewModel, { kind: 'success' }>;
}

/**
 * Рендерит success-state закрепленного материала.
 *
 * @param pinned - Success view model pinned-блока.
 * @returns Успешное состояние pinned-card.
 */
export function PlaceDetailPinnedCardSuccessState({
  pinned,
}: Readonly<PlaceDetailPinnedCardSuccessStateProps>) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack spacing={1}>
            <Typography variant="overline" color="text.secondary">
              {pinned.eyebrow}
            </Typography>

            <Typography variant="h6" component="h2">
              {pinned.title}
            </Typography>
          </Stack>

          <PlaceDetailPinnedCardMetaChips chips={pinned.metaChips} />

          <Button
            component={AppLink}
            href={pinned.href}
            variant="contained"
            sx={{ alignSelf: 'flex-start' }}
          >
            {pinned.actionLabel}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
