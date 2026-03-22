const MATERIAL_PUBLISHED_AT_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/**
 * Форматирует дату публикации материала для UI.
 */
export function formatMaterialPublishedAt(value: string): string {
  return MATERIAL_PUBLISHED_AT_FORMATTER.format(new Date(value));
}
