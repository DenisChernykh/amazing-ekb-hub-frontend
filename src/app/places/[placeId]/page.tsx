import { Container, Paper, Typography } from '@mui/material';

interface PlacePageProps {
  params: Promise<{
    placeId: string;
  }>;
}

/**
 * Временная страница детальной карточки места.
 *
 * @param props - Route params страницы места.
 */
export default async function PlacePage({ params }: PlacePageProps) {
  const { placeId } = await params;

  return (
    <Container component="main" maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
      <Paper elevation={0} sx={{ borderRadius: 2, p: 3 }}>
        <Typography component="h1" variant="h4">
          hello {placeId}
        </Typography>
      </Paper>
    </Container>
  );
}
