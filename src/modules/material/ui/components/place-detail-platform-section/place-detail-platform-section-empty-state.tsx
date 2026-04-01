import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { PlaceDetailSectionViewModel } from '../../view-model';
import { PlaceDetailPlatformSectionHeader } from './place-detail-platform-section-header';

interface PlaceDetailPlatformSectionEmptyStateProps {
  section: Extract<PlaceDetailSectionViewModel, { kind: 'empty' }>;
}

/**
 * Рендерит empty-state платформенной секции.
 *
 * @param section - Empty view model секции.
 * @returns Пустое состояние платформенной секции.
 */
export function PlaceDetailPlatformSectionEmptyState({
  section,
}: Readonly<PlaceDetailPlatformSectionEmptyStateProps>) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <PlaceDetailPlatformSectionHeader title={section.title} countLabel={section.countLabel} />

          <Typography variant="body2" color="text.secondary">
            {section.description}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
