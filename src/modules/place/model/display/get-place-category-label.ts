import { PlaceCategory } from '@/modules/place/model/entity';

const PLACE_CATEGORY_LABELS: Record<PlaceCategory, string> = {
  pools: 'Бассейны',
  spa: 'Спа',
  cafe: 'Кафе',
  hotels: 'Отели',
  workshops: 'Мастер-классы',
};

/**
 * Возвращает человекочитаемый лейбл категории места.
 *
 * @param category - Категория места.
 * @returns Пользовательский лейбл для UI.
 */
export function getPlaceCategoryLabel(category: PlaceCategory): string {
  return PLACE_CATEGORY_LABELS[category];
}
