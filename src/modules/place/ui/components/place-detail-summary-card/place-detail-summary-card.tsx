import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { PlaceDetailSummaryViewModel } from '../../view-model';

/**
 * Параметры summary-карточки detail-экрана.
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
        <Stack spacing={2}>
          <Chip label={summary.categoryLabel} sx={{ alignSelf: 'flex-start' }} />

          <Typography variant="h4" component="h1">
            {summary.title}
          </Typography>

          <Typography variant="body1" color="text.secondary">
            {summary.summary}
          </Typography>

          {summary.tags.length > 0 && (
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {summary.tags.map((tag) => (
                <Chip key={tag} label={tag} variant="outlined" />
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
