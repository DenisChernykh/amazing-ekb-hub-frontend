import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { PLACE_FEED_CATEGORY_BACKGROUND, PLACE_FEED_SKELETON_CATEGORIES } from '../../config';

/**
 * Пропсы skeleton-карточки места.
 */
export interface PlaceCardSkeletonProps {
  category: (typeof PLACE_FEED_SKELETON_CATEGORIES)[number];
}

/**
 * Презентационный skeleton одной карточки места.
 *
 * @param props - Категория, используемая только для tonal media fallback.
 * @returns Skeleton карточки места.
 */
export function PlaceCardSkeleton({ category }: Readonly<PlaceCardSkeletonProps>) {
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
