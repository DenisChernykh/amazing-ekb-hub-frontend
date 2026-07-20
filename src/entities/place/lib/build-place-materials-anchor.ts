import type { Platform } from '@/shared/api/generated/model/platform';

/**
 * Это хелпер. Собирает id секции материалов платформы на странице места.
 *
 * @param platform - Платформа материалов.
 * @returns Стабильный anchor id для секции платформы.
 */
export function buildPlaceMaterialsAnchor(platform: Platform): string {
  return `materials-${platform}`;
}
