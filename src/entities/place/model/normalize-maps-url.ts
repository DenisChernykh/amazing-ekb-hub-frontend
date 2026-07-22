/**
 * Это хелпер. Нормализует nullable URL карточки места в Яндекс Картах.
 *
 * @param mapsUrl - Canonical URL из backend detail-контракта.
 * @returns Непустой URL или `null`, если ссылка отсутствует.
 */
export function normalizeMapsUrl(mapsUrl: string | null): string | null {
  const normalizedUrl = mapsUrl?.trim();

  return normalizedUrl ? normalizedUrl : null;
}
