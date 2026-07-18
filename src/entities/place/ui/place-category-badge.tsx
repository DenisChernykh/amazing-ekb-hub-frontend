import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui';
import type { PlaceCategory } from '../model/types';

interface PlaceCategoryBadgeProps {
  category: PlaceCategory;
  className?: string;
}

/**
 * Рендерит reusable бейдж категории места.
 *
 * @param props - Категория и визуальные настройки бейджа.
 */
export function PlaceCategoryBadge({ category, className }: Readonly<PlaceCategoryBadgeProps>) {
  return (
    <Badge className={cn('border-transparent font-bold', className)} variant="secondary">
      {category.title}
    </Badge>
  );
}
