import type { PlaceDetailSectionViewModel } from '@/widgets/place-detail/model/place-detail-screen.view-model.types';
import { Alert, Card, CardContent, Stack, Typography } from '@mui/material';
import { PlaceDetailMaterialList } from './place-detail-material-list';
import { PlaceDetailSectionPagination } from './place-detail-section-pagination';

/**
 * Параметры платформенной секции detail-экрана.
 */
export interface PlaceDetailPlatformSectionProps {
  section: PlaceDetailSectionViewModel;
}

/**
 * Рендерит одну платформенную секцию detail-экрана.
 *
 * @param section - Готовая view model платформенной секции.
 * @returns MUI-карточку платформенной секции.
 */
export function PlaceDetailPlatformSection({ section }: Readonly<PlaceDetailPlatformSectionProps>) {
  switch (section.kind) {
    case 'empty':
      return (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <SectionHeader title={section.title} countLabel={section.countLabel} />

              <Typography variant="body2" color="text.secondary">
                {section.description}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      );

    case 'error':
      return (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <SectionHeader title={section.title} countLabel={section.countLabel} />

              <Alert severity="error">{section.message}</Alert>
            </Stack>
          </CardContent>
        </Card>
      );

    case 'success':
      return (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <SectionHeader title={section.title} countLabel={section.countLabel} />

              {section.items.length > 0 ? (
                <PlaceDetailMaterialList items={section.items} />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {section.emptyPageDescription}
                </Typography>
              )}

              {section.pagination ? (
                <PlaceDetailSectionPagination pagination={section.pagination} />
              ) : null}
            </Stack>
          </CardContent>
        </Card>
      );
  }
}

interface SectionHeaderProps {
  title: string;
  countLabel: string;
}

/**
 * Рендерит общий header платформенной секции.
 */
function SectionHeader({ title, countLabel }: Readonly<SectionHeaderProps>) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
    >
      <Typography variant="h6" component="h2">
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        {countLabel}
      </Typography>
    </Stack>
  );
}
