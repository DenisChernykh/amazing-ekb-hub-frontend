import type { PlaceCategory } from '@/shared/api/generated/model/placeCategory';
import type { Platform } from '@/shared/api/generated/model/platform';
import type { PlaceDisplayMeta, PlatformCounters } from './types';

const CATEGORY_DISPLAY: Record<PlaceCategory, PlaceDisplayMeta> = {
  pools: { label: 'Бассейны', color: '#075985', backgroundColor: '#e0f2fe' },
  spa: { label: 'SPA', color: '#9f1239', backgroundColor: '#ffe4e6' },
  cafe: { label: 'Кафе', color: '#92400e', backgroundColor: '#fef3c7' },
  hotels: { label: 'Отели', color: '#3730a3', backgroundColor: '#e0e7ff' },
  workshops: { label: 'Мастерские', color: '#065f46', backgroundColor: '#d1fae5' },
};

const PLATFORM_DISPLAY: Record<Platform, PlaceDisplayMeta> = {
  dzen: { label: 'Дзен', color: '#111827', backgroundColor: '#e5e7eb' },
  telegram: { label: 'Telegram', color: '#075985', backgroundColor: '#dff3ff' },
  instagram: { label: 'Instagram', color: '#9d174d', backgroundColor: '#fce7f3' },
};

/**
 * Это хелпер. Возвращает подпись и цветовой тон категории.
 *
 * @param category - Категория места из API.
 * @returns Display-метаданные категории для UI.
 */
export function getPlaceCategoryDisplay(category: PlaceCategory): PlaceDisplayMeta {
  return CATEGORY_DISPLAY[category];
}

/**
 * Это хелпер. Возвращает подпись и цветовой тон платформы.
 *
 * @param platform - Платформа материала.
 * @returns Display-метаданные платформы для UI.
 */
export function getPlatformDisplay(platform: Platform): PlaceDisplayMeta {
  return PLATFORM_DISPLAY[platform];
}

/**
 * Это хелпер. Оставляет только платформы с ненулевым количеством материалов.
 *
 * @param counters - Счетчики материалов по платформам.
 * @returns Список платформ и счетчиков, которые нужно показать в карточке.
 */
export function getVisiblePlatformCounters(counters: PlatformCounters) {
  return Object.entries(counters).flatMap(([platform, count]) =>
    count > 0 ? [{ platform: platform as Platform, count }] : [],
  );
}
