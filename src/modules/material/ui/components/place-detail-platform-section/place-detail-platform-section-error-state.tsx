import { Alert, Card, CardContent, Stack, Typography } from '@mui/material';
import type { PlaceDetailSectionViewModel } from '../../view-model';
import { PlaceDetailPlatformSectionHeader } from './place-detail-platform-section-header';

interface PlaceDetailPlatformSectionErrorStateProps {
  section: Extract<PlaceDetailSectionViewModel, { kind: 'error' }>;
}

/**
 * Рендерит error-state платформенной секции.
 *
 * @param section - Error view model секции.
 * @returns Состояние ошибки платформенной секции.
 */
export function PlaceDetailPlatformSectionErrorState({
  section,
}: Readonly<PlaceDetailPlatformSectionErrorStateProps>) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <PlaceDetailPlatformSectionHeader title={section.title} countLabel={section.countLabel} />

          <Alert severity="error">
            <Stack spacing={0.5}>
              <Typography variant="body2">{section.message}</Typography>

              {section.requestId && (
                <Typography variant="caption" color="text.secondary">
                  Request ID: {section.requestId}
                </Typography>
              )}
            </Stack>
          </Alert>
        </Stack>
      </CardContent>
    </Card>
  );
}
