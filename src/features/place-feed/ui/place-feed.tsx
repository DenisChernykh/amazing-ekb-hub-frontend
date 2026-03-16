import type { PlaceFeedViewModel } from '@/features/place-feed/model/place-feed.view-model.types';

import { Alert, Box, Grid, Paper, Stack, Typography } from '@mui/material';
import { PlaceCard } from './place-card';

/**
 * Параметры presentation-компонента ленты мест.
 */
export interface PlaceFeedProps {
  viewModel: PlaceFeedViewModel;
}
/**
 * Рендерит состояния home-ленты мест: success, empty, error.
 *
 * @param viewModel - Готовая presentation-модель ленты мест.
 * @returns Presentation-компонент ленты мест.
 */
export function PlaceFeed({ viewModel }: Readonly<PlaceFeedProps>) {
  switch (viewModel.kind) {
    case 'error':
      return (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Alert severity="error">
            <Typography variant="subtitle2" component="p" sx={{ mb: 0.5 }}>
              {viewModel.title}
            </Typography>

            <Typography variant="body2">{viewModel.description}</Typography>
          </Alert>
        </Paper>
      );

    case 'empty':
      return (
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={1} alignItems="center" textAlign="center">
            <Typography variant="h6" component="h2">
              Ничего не найдено
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {viewModel.description}
            </Typography>
          </Stack>
        </Paper>
      );

    case 'success':
      return (
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3}>
            <Box>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
              >
                <Typography variant="h5" component="h2">
                  {viewModel.title}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {viewModel.meta}
                </Typography>
              </Stack>
            </Box>

            <Grid container spacing={3}>
              {viewModel.items.map((place) => (
                <Grid key={place.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <PlaceCard place={place} />
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Paper>
      );
  }
}
