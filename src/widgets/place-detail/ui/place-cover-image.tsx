import type { PlaceDetailModel } from '@/entities/place';
import { appStyleTokens } from '@/shared/ui/theme';
import { CardMedia, Paper } from '@mui/material';

const PLACE_PLACEHOLDER_IMAGE_SRC = '/images/places/place-placeholder.webp';

interface PlaceCoverImageProps {
  place: Pick<PlaceDetailModel, 'coverImageUrl' | 'title'>;
}

/**
 * Рендерит cover-фото места с fallback-изображением.
 */
export function PlaceCoverImage({ place }: Readonly<PlaceCoverImageProps>) {
  const imageSrc = place.coverImageUrl ?? PLACE_PLACEHOLDER_IMAGE_SRC;

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        overflow: 'hidden',
        height: '100%',
        minHeight: { xs: 260, md: 360 },
        bgcolor: appStyleTokens.palette.imagePlaceholder,
      }}
    >
      <CardMedia
        alt={`Фото места ${place.title}`}
        component="img"
        src={imageSrc}
        sx={{
          width: '100%',
          height: '100%',
          minHeight: { xs: 260, md: 360 },
          objectFit: 'cover',
        }}
      />
    </Paper>
  );
}
