/**
 * Это хелпер. Собирает публичный href страницы места.
 *
 * @param placeSlug - Публичный slug места.
 * @returns Абсолютный path внутри приложения.
 */
export function buildPlaceHref(placeSlug: string): string {
  return `/places/${encodeURIComponent(placeSlug)}`;
}
