import { Box, CardMedia, Chip } from '@mui/material';
import { getPlaceCategoryDisplay } from '../model/place-display';
import type { PlaceCardModel } from '../model/types';

const PLACE_PLACEHOLDER_IMAGE_SRC = '/images/places/place-placeholder.webp';

interface PlaceCardImageProps {
  category: PlaceCardModel['category'];
  src: string | null;
  title: string;
}

/**
 * Рендерит фото карточки места с локальной заглушкой.
 *
 * @param props - Данные изображения карточки.
 */
export function PlaceCardImage({ category, src, title }: Readonly<PlaceCardImageProps>) {
  const imageSrc = src?.trim() ? src : PLACE_PLACEHOLDER_IMAGE_SRC;
  const categoryDisplay = getPlaceCategoryDisplay(category);

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        aspectRatio: '4 / 3',
        bgcolor: '#edf2f0',
      }}
    >
      <CardMedia
        component="img"
        src={imageSrc}
        alt={`Фото места ${title}`}
        className="place-card-image"
        loading="lazy"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'transform 260ms ease',
        }}
      />

      <Chip
        label={categoryDisplay.label}
        size="small"
        sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 1,
          bgcolor: categoryDisplay.backgroundColor,
          color: categoryDisplay.color,
          fontWeight: 700,
          boxShadow: '0 8px 20px rgba(15, 23, 42, 0.14)',
        }}
      />
    </Box>
  );
}
