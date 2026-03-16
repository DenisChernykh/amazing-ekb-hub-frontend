import type { PlaceListResult } from '@/entities/place';
import { buildPlaceFeedViewModel, PlaceFeed } from '@/features/place-feed';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';

/**
 * Параметры page-level presentation для главной страницы.
 */
export interface HomePageContentProps {
  result: PlaceListResult;
}
/**
 * Рендерит page-level композицию главной страницы со вступительным блоком и лентой мест.
 *
 * @param result - Result-first ответ загрузки списка мест для home-экрана.
 * @returns Серверный presentation-компонент главной страницы.
 */
export function HomePageContent({ result }: Readonly<HomePageContentProps>) {
  const placeFeedViewModel = buildPlaceFeedViewModel(result);
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
                Главная остается экраном выбора места: данные уже грузятся с backend, а карточный
                presentation вынесен в отдельный feature-слой.
              </Typography>
            </Stack>
          </Paper>
          <PlaceFeed viewModel={placeFeedViewModel} />
        </Stack>
      </Container>
    </Box>
  );
}
