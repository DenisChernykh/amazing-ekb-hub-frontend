import { PlaceCard } from '@/entities/place';
import { PlacesPagination } from '@/features/places-pagination';
import { Container, Grid, Stack, Typography } from '@mui/material';
import type { PlacesCatalogModel } from '../model/types';
import { PlacesCatalogEmpty } from './places-catalog-empty';

interface PlacesCatalogProps {
  model: PlacesCatalogModel;
}

/**
 * Собирает рабочий каталог мест: заголовок, сетку карточек и пагинацию.
 *
 * @param props - Модель каталога мест.
 */
export function PlacesCatalog({ model }: Readonly<PlacesCatalogProps>) {
  const { items, pagination } = model;

  return (
    <Container
      component="main"
      maxWidth="lg"
      sx={{
        py: { xs: 3.75, sm: 6 },
        pb: 8,
      }}
    >
      <Stack
        component="header"
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
        gap={2.25}
        mb={3.5}
      >
        <Stack spacing={1.25}>
          <Typography
            color="#111827"
            component="h1"
            fontSize="clamp(2rem, 1.4rem + 2vw, 3.4rem)"
            fontWeight={700}
            letterSpacing={0}
            lineHeight={1.04}
          >
            Места
          </Typography>
          <Typography color="#5f6b7a">Найдено: {pagination.total}</Typography>
        </Stack>

        <Typography color="#5f6b7a" mb={{ xs: 0, sm: 0.75 }} whiteSpace="nowrap">
          Страница {pagination.page} из {pagination.pageCount}
        </Typography>
      </Stack>

      {items.length > 0 ? (
        <Grid aria-label="Список мест" container component="section" spacing={{ xs: 2, sm: 2.5 }}>
          {items.map((place) => (
            <Grid key={place.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <PlaceCard place={place} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <PlacesCatalogEmpty />
      )}

      <PlacesPagination pagination={pagination} />
    </Container>
  );
}
