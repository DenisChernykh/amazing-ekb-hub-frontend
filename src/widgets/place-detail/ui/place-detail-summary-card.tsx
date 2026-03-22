import type { PlaceDetailSummaryViewModel } from '@/widgets/place-detail/model/place-detail-screen.view-model.types';
import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';

/**
 * Параметры summary-карточки места.
 */
export interface PlaceDetailSummaryCardProps {
  summary: PlaceDetailSummaryViewModel;
}

/**
 * Рендерит основной информационный блок о месте.
 *
 * @param summary - View model summary-блока.
 * @returns MUI-карточку с категорией, заголовком, описанием и тегами.
 */
export function PlaceDetailSummaryCard({ summary }: Readonly<PlaceDetailSummaryCardProps>) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack>
          <Chip label={summary.categoryLabel} />

          <Typography variant="h4" component="h1">
            {summary.title}
          </Typography>

          <Typography variant="body1" color="text.secondary">
            {summary.summary}
          </Typography>

          {summary.tags.length > 0 ? (
            <Stack direction="row">
              {summary.tags.map((tag) => (
                <Chip key={tag} label={tag} variant="outlined" />
              ))}
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
