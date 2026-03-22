import { Box, Grid, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { PLACE_FEED_CATEGORY_BACKGROUND, PLACE_FEED_SKELETON_CATEGORIES } from '../lib';

/**
 * Параметры skeleton-ленты мест.
 */
export interface PlaceFeedSkeletonProps {
  count?: number;
}

/**
 * Презентационный skeleton одной карточки места.
 *
 * @param category - Категория, используемая только для tonal media fallback.
 * @returns Skeleton карточки места.
 */
function PlaceCardSkeleton({
  category,
}: Readonly<{ category: (typeof PLACE_FEED_SKELETON_CATEGORIES)[number] }>) {
  return (
    <Paper variant="outlined" sx={{ height: '100%', overflow: 'hidden' }}>
      <Box
        sx={{
          minHeight: 168,
          px: 2.5,
          py: 2,
          background: PLACE_FEED_CATEGORY_BACKGROUND[category],
        }}
      >
        <Typography variant="overline" color="text.secondary">
          Загрузка
        </Typography>
      </Box>

      <Stack spacing={1.5} sx={{ p: 2.5 }}>
        <Skeleton variant="text" width="62%" height={36} />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="88%" />
        <Skeleton variant="rounded" width="38%" height={32} />
      </Stack>
    </Paper>
  );
}

/**
 * Route-level skeleton home-ленты мест.
 *
 * @param count - Количество placeholder карточек.
 * @returns Skeleton списка мест.
 */
export function PlaceFeedSkeleton({ count = 5 }: Readonly<PlaceFeedSkeletonProps>) {
  const items = Array.from({ length: count }, (_, index) => ({
    id: `skeleton-${index}`,
    category: PLACE_FEED_SKELETON_CATEGORIES[index % PLACE_FEED_SKELETON_CATEGORIES.length],
  }));

  return (
    <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
      <Stack spacing={3}>
        <Typography variant="h5" component="h2">
          Загружаем места...
        </Typography>

        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <PlaceCardSkeleton category={item.category} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Paper>
  );
}
