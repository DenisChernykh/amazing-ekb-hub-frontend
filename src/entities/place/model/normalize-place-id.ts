const PLACE_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const PLACE_ID_MAX_LENGTH = 128;

/**
 * Это хелпер. Валидирует route placeId и готовит его для backend path segment.
 *
 * @param placeId - Идентификатор места из route params.
 * @returns Encoded path segment или `null`, если значение не похоже на backend id.
 */
export function normalizePlaceIdForBackendPath(placeId: string): string | null {
  if (!placeId) return null;
  if (placeId.length > PLACE_ID_MAX_LENGTH) return null;
  if (!PLACE_ID_PATTERN.test(placeId)) return null;

  return encodeURIComponent(placeId);
}
