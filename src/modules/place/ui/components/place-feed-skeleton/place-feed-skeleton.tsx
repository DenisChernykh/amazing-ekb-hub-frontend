import { Grid, Paper, Stack, Typography } from '@mui/material';
import { PLACE_FEED_SKELETON_CATEGORIES } from '../../config';
import { PlaceCardSkeleton } from './place-card-skeleton';

/**
 * Параметры skeleton-ленты мест.
 */
export interface PlaceFeedSkeletonProps {
  count?: number;
}

/**
 * Skeleton списка мест.
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
