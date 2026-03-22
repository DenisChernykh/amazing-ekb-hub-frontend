import { PlaceCategory } from '@/entities/place/model/place';

const PLACE_CATEGORY_LABELS: Record<PlaceCategory, string> = {
  pools: 'Бассейны',
  spa: 'Спа',
  cafe: 'Кафе',
  hotels: 'Отели',
  workshops: 'Мастер-классы',
};

/**
 * Возвращает человекочитаемый лейбл категории места.
 */
export function getPlaceCategoryLabel(category: PlaceCategory): string {
  return PLACE_CATEGORY_LABELS[category];
}
