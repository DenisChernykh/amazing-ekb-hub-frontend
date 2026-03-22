import type { PlaceDetailPinnedCardViewModel } from '@/widgets/place-detail/model/place-detail-screen.view-model.types';
import { Button, Card, CardActions, CardContent, Chip, Stack, Typography } from '@mui/material';

/**
 * Параметры pinned-блока detail-экрана.
 */
export interface PlaceDetailPinnedCardProps {
  pinned: PlaceDetailPinnedCardViewModel;
}

/**
 * Рендерит блок закрепленного материала.
 *
 * @param pinned - Готовая view model закрепленного материала.
 * @returns MUI-карточку закрепленного материала.
 */
export function PlaceDetailPinnedCard({ pinned }: Readonly<PlaceDetailPinnedCardProps>) {
  if (pinned.kind === 'empty') {
    return (
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="h6" component="h2">
              {pinned.title}
            </Typography>

            <Typography variant="body2">{pinned.description}</Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack spacing={1}>
            <Typography variant="overline">{pinned.eyebrow}</Typography>

            <Typography variant="h5" component="h2">
              {pinned.title}
            </Typography>
          </Stack>

          {pinned.metaChips.length > 0 ? (
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {pinned.metaChips.map((chip) => (
                <Chip key={chip} label={chip} size="small" variant="outlined" />
              ))}
            </Stack>
          ) : null}
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button href={pinned.href} target="_blank" rel="noreferrer" variant="contained">
          {pinned.actionLabel}
        </Button>
      </CardActions>
    </Card>
  );
}
