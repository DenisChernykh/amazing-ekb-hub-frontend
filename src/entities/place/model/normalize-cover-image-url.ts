/**
 * Это хелпер. Нормализует URL cover-фото из текущего или будущего backend-контракта.
 *
 * @param coverImageUrl - URL фото из API.
 * @returns Непустой URL или `null`, если фото нет.
 */
export function normalizeCoverImageUrl(coverImageUrl?: string | null): string | null {
  const normalizedUrl = coverImageUrl?.trim();

  return normalizedUrl ? normalizedUrl : null;
}
