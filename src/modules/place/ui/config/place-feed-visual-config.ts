import type { PlaceCategory } from '@/modules/place/model';

/**
 * Категории, используемые для skeleton-карточек home-экрана.
 */
export const PLACE_FEED_SKELETON_CATEGORIES: readonly PlaceCategory[] = [
  'spa',
  'pools',
  'cafe',
  'hotels',
  'workshops',
];

/**
 * Фоновая палитра карточек мест по категориям.
 */
export const PLACE_FEED_CATEGORY_BACKGROUND: Record<PlaceCategory, string> = {
  pools: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
  spa: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
  cafe: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
  hotels: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
  workshops: 'linear-gradient(135deg, #efebe9 0%, #d7ccc8 100%)',
};

/**
 * Цветовая схема category-chip для карточек мест.
 */
export const PLACE_FEED_CATEGORY_CHIP_COLOR: Record<
  PlaceCategory,
  'default' | 'primary' | 'secondary' | 'success' | 'warning'
> = {
  pools: 'primary',
  spa: 'secondary',
  cafe: 'warning',
  hotels: 'default',
  workshops: 'success',
};
