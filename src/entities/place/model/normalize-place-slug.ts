const PLACE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Это хелпер. Валидирует публичный route slug для backend path segment.
 *
 * @param placeSlug - Публичный slug места из route params.
 * @returns Slug или `null`, если он не соответствует backend-контракту.
 */
export function normalizePlaceSlugForBackendPath(placeSlug: string): string | null {
  if (!placeSlug) return null;
  if (!PLACE_SLUG_PATTERN.test(placeSlug)) return null;

  return placeSlug;
}
