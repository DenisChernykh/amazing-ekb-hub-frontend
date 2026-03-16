import AppLink from '@/shared/ui/app-link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface PlaceDetailPageProps {
  params: Promise<{ placeId: string }>;
}

/**
 * Временная detail-route заглушка для сценария перехода из home-карточки.
 *
 * @param params - Dynamic route params Next App Router.
 * @returns Экран-заглушку для будущей страницы места.
 */
export default async function PlaceDetailPage({ params }: Readonly<PlaceDetailPageProps>) {
  const { placeId } = await params;

  return (
    <Box component="main" sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2}>
              <Typography variant="h3" component="h1">
                Страница места будет следующим шагом
              </Typography>

              <Typography variant="body1" color="text.secondary">
                Маршрут уже подключен, поэтому карточка ведет на реальную страницу, а не в пустую
                заглушку браузера.
              </Typography>

              <Box>
                <Button component={AppLink} href="/" variant="contained">
                  Вернуться к списку мест
                </Button>
              </Box>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2}>
              <Typography variant="h5" component="h2">
                Текущий route param
              </Typography>

              <Box
                component="code"
                sx={{
                  alignSelf: 'flex-start',
                  px: 1.5,
                  py: 0.75,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '0.875rem',
                }}
              >
                {placeId}
              </Box>

              <Typography variant="body2" color="text.secondary">
                Пока здесь только route-level заглушка. На следующей итерации сюда можно будет
                поднимать загрузку detail-данных места и материалов.
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
