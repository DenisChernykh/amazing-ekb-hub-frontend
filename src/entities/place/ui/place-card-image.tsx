import { appStyleTokens } from '@/shared/ui/theme';
import { Box, CardMedia } from '@mui/material';
import type { PlaceCardModel } from '../model/types';
import { PlaceCategoryBadge } from './place-category-badge';

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

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        aspectRatio: '4 / 3',
        bgcolor: appStyleTokens.palette.imagePlaceholder,
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

      <PlaceCategoryBadge
        category={category}
        className="absolute top-3 left-3 z-[1]"
        style={{ boxShadow: appStyleTokens.shadows.overlayBadge }}
      />
    </Box>
  );
}
