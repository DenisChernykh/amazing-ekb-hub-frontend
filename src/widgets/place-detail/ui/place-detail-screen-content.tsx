import AppLink from '@/shared/ui/app-link';
import type { PlaceDetailScreenViewModel } from '@/widgets/place-detail/model/place-detail-screen.view-model.types';
import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material';
import { PlaceDetailCounters } from './place-detail-counters';
import { PlaceDetailPinnedCard } from './place-detail-pinned-card';
import { PlaceDetailPlatformSection } from './place-detail-platform-section';
import { PlaceDetailSummaryCard } from './place-detail-summary-card';

/**
 * Параметры screen-level presentation для detail-экрана места.
 */
export interface PlaceDetailScreenContentProps {
  viewModel: PlaceDetailScreenViewModel;
}

/**
 * Рендерит detail-экран места из готового screen-level view model.
 *
 * @param viewModel - Готовая presentation-модель detail-экрана.
 * @returns Screen-level MUI-композицию detail-экрана.
 */
export function PlaceDetailScreenContent({ viewModel }: Readonly<PlaceDetailScreenContentProps>) {
  if (viewModel.kind === 'error') {
    return (
      <Box component="main" sx={{ py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Alert severity="error">
            <Typography variant="subtitle2" component="p" sx={{ mb: 0.5 }}>
              {viewModel.title}
            </Typography>

            <Typography variant="body2">{viewModel.description}</Typography>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Button component={AppLink} href={viewModel.actions.backHref} variant="contained">
              Назад к списку
            </Button>

            <Button variant="outlined" disabled={viewModel.actions.favoriteDisabled}>
              В избранное
            </Button>
          </Stack>

          <PlaceDetailSummaryCard summary={viewModel.summary} />

          <PlaceDetailCounters counters={viewModel.counters} />

          <PlaceDetailPinnedCard pinned={viewModel.pinned} />

          <Stack spacing={2}>
            {viewModel.sections.map((section) => (
              <PlaceDetailPlatformSection key={section.platform} section={section} />
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
