/**
 * Канонический порядок платформ материалов во frontend.
 */
export const MATERIAL_PLATFORMS = ['dzen', 'telegram', 'instagram'] as const;

/**
 * Поддерживаемые платформы публикации материалов.
 */
export type Platform = (typeof MATERIAL_PLATFORMS)[number];

/**
 * Поддерживаемые типы материалов.
 */
export type MaterialType = 'post' | 'reel' | 'video';

/**
 * Короткое представление материала.
 */
export type MaterialPreview = {
  id: string;
  placeId: string;
  platform: Platform;
  type: MaterialType;
  title: string;
  publishedAt: string;
  durationSec: number | null;
  url: string;
};

/**
 * Доменная модель материала места.
 */
export type Material = MaterialPreview;

/**
 * Доменная модель пагинированного списка материалов места.
 */
export type MaterialList = {
  items: Material[];
  total: number;
  page: number;
  pageSize: number;
};
