import type { PlaceCategory } from '@/shared/api/generated/model/placeCategory';
import { Chip, type ChipProps } from '@mui/material';
import { getPlaceCategoryDisplay } from '../model/place-display';

interface PlaceCategoryBadgeProps {
  category: PlaceCategory;
  size?: ChipProps['size'];
  sx?: ChipProps['sx'];
}

/**
 * Рендерит reusable бейдж категории места.
 *
 * @param props - Категория и визуальные настройки бейджа.
 */
export function PlaceCategoryBadge({
  category,
  size = 'small',
  sx,
}: Readonly<PlaceCategoryBadgeProps>) {
  const categoryDisplay = getPlaceCategoryDisplay(category);

  return (
    <Chip
      label={categoryDisplay.label}
      size={size}
      sx={[
        {
          bgcolor: categoryDisplay.backgroundColor,
          color: categoryDisplay.color,
          fontWeight: 700,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}
