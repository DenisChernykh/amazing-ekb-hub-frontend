import type { PlaceDetailModel } from '@/entities/place';
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
      sx={{
        overflow: 'hidden',
        height: '100%',
        minHeight: { xs: 260, md: 360 },
        bgcolor: '#edf2f0',
        border: '1px solid rgba(31, 41, 55, 0.1)',
        borderRadius: 2,
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
