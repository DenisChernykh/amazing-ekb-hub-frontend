import type { PlaceCategory } from '@/entities/place';

type BuildCatalogControlsInputKeyOptions = {
  search?: string;
  category?: PlaceCategory;
};

/**
 * Это хелпер. Строит remount key для uncontrolled search input по примененным URL-фильтрам.
 *
 * @param options - Примененные search/category из server-side модели.
 * @returns Стабильный key, меняющийся при смене примененного состояния filters.
 */
export function buildCatalogControlsInputKey({
  search,
  category,
}: BuildCatalogControlsInputKeyOptions): string {
  return `search=${search ?? ''}|category=${category ?? 'all'}`;
}
