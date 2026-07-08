type BuildCatalogControlsInputKeyOptions = {
  search?: string;
  category?: string;
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
