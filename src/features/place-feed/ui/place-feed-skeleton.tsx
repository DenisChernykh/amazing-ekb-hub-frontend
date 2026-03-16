import type { PlaceCategory } from '@/entities/place';
import { Box, Grid, Paper, Skeleton, Stack, Typography } from '@mui/material';
/**
 * Параметры skeleton-ленты мест.
 */
export interface PlaceFeedSkeletonProps {
  count?: number;
}

const SKELETON_CATEGORIES: readonly PlaceCategory[] = [
  'spa',
  'pools',
  'cafe',
  'hotels',
  'workshops',
];

const categoryBackgroundByType: Record<PlaceCategory, string> = {
  pools: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
  spa: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
  cafe: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
  hotels: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
  workshops: 'linear-gradient(135deg, #efebe9 0%, #d7ccc8 100%)',
};

/**
 * Презентационный skeleton одной карточки места.
 *
 * @param category - Категория, используемая только для tonal media fallback.
 * @returns Skeleton карточки места.
 */
function PlaceCardSkeleton({ category }: Readonly<{ category: PlaceCategory }>) {
  return (
    <Paper variant="outlined" sx={{ height: '100%', overflow: 'hidden' }}>
      <Box
        sx={{
          minHeight: 168,
          px: 2.5,
          py: 2,
          background: categoryBackgroundByType[category],
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
    category: SKELETON_CATEGORIES[index % SKELETON_CATEGORIES.length],
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
