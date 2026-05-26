const MATERIAL_REDIRECT_URL_PREFIX = '/v1/materials/';
const MATERIAL_REDIRECT_URL_SUFFIX = '/go';

/**
 * Это хелпер. Нормализует backend redirect URL для публичного открытия материала.
 *
 * @param rawRedirectUrl - Same-origin redirect URL из backend material DTO.
 * @param materialId - Идентификатор материала, для которого ожидается redirect URL.
 * @returns Безопасный относительный redirect URL или `null`.
 */
export function normalizeMaterialRedirectUrl(
  rawRedirectUrl: string | null | undefined,
  materialId: string,
): string | null {
  if (typeof rawRedirectUrl !== 'string' || rawRedirectUrl.trim() !== rawRedirectUrl) {
    return null;
  }

  if (
    !rawRedirectUrl.startsWith(MATERIAL_REDIRECT_URL_PREFIX) ||
    !rawRedirectUrl.endsWith(MATERIAL_REDIRECT_URL_SUFFIX)
  ) {
    return null;
  }

  const encodedMaterialId = rawRedirectUrl.slice(
    MATERIAL_REDIRECT_URL_PREFIX.length,
    -MATERIAL_REDIRECT_URL_SUFFIX.length,
  );

  if (!encodedMaterialId || encodedMaterialId.includes('/')) {
    return null;
  }

  try {
    return decodeURIComponent(encodedMaterialId) === materialId ? rawRedirectUrl : null;
  } catch {
    return null;
  }
}
