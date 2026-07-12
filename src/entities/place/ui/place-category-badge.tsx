import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui';
import type { CSSProperties } from 'react';
import { getPlaceCategoryDisplay } from '../model/place-display';
import type { PlaceCategory } from '../model/types';

interface PlaceCategoryBadgeProps {
  category: PlaceCategory;
  className?: string;
  style?: CSSProperties;
}

/**
 * Рендерит reusable бейдж категории места.
 *
 * @param props - Категория и визуальные настройки бейджа.
 */
export function PlaceCategoryBadge({
  category,
  className,
  style,
}: Readonly<PlaceCategoryBadgeProps>) {
  const categoryDisplay = getPlaceCategoryDisplay(category);

  return (
    <Badge
      className={cn('border-transparent font-bold', className)}
      style={{
        backgroundColor: categoryDisplay.backgroundColor,
        color: categoryDisplay.color,
        ...style,
      }}
    >
      {categoryDisplay.label}
    </Badge>
  );
}
