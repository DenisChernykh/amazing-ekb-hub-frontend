import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { PlaceDetailSectionViewModel } from '../../view-model';
import { PlaceDetailMaterialList } from '../place-detail-material-list';
import { PlaceDetailSectionPagination } from '../place-detail-section-pagination';
import { PlaceDetailPlatformSectionHeader } from './place-detail-platform-section-header';

interface PlaceDetailPlatformSectionSuccessStateProps {
  section: Extract<PlaceDetailSectionViewModel, { kind: 'success' }>;
}

/**
 * Рендерит success-state платформенной секции.
 *
 * @param section - Success view model секции.
 * @returns Успешное состояние платформенной секции.
 */
export function PlaceDetailPlatformSectionSuccessState({
  section,
}: Readonly<PlaceDetailPlatformSectionSuccessStateProps>) {
  const hasItems = section.items.length > 0;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <PlaceDetailPlatformSectionHeader title={section.title} countLabel={section.countLabel} />

          {hasItems && <PlaceDetailMaterialList items={section.items} />}

          {!hasItems && (
            <Typography variant="body2" color="text.secondary">
              {section.emptyPageDescription}
            </Typography>
          )}

          {section.pagination && <PlaceDetailSectionPagination pagination={section.pagination} />}
        </Stack>
      </CardContent>
    </Card>
  );
}
