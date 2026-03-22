import type { PlaceListResult } from '@/entities/place';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import { buildPlaceFeedViewModel } from '../model/place-feed.view-model';
import { PlaceFeed } from './place-feed';

/**
 * Параметры screen-level widget для home/place-feed экрана.
 */
export interface PlaceFeedScreenProps {
  result: PlaceListResult;
}

/**
 * Рендерит весь home-экран как widget-level композицию.
 *
 * @param result - Result-first ответ загрузки списка мест.
 * @returns Полный home screen с intro-блоком и лентой мест.
 */
export function PlaceFeedScreen({ result }: Readonly<PlaceFeedScreenProps>) {
  const viewModel = buildPlaceFeedViewModel(result);

  return (
    <Box component="main" sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2}>
              <Typography variant="overline" component="p" sx={{ color: 'text.secondary' }}>
                Стрельчук в Екатеринбурге
              </Typography>

              <Typography variant="body1" color="text.secondary">
                Главная остается экраном выбора места: данные уже грузятся с backend, а экранная
                композиция и presentation теперь собраны в widget-слое.
              </Typography>
            </Stack>
          </Paper>

          <PlaceFeed viewModel={viewModel} />
        </Stack>
      </Container>
    </Box>
  );
}
