/**
 * Это хелпер. Собирает публичный href страницы места.
 *
 * @param placeId - Идентификатор места.
 * @returns Абсолютный path внутри приложения.
 */
export function buildPlaceHref(placeId: string): string {
  return `/places/${encodeURIComponent(placeId)}`;
}
