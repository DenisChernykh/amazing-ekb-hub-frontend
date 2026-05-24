import type { Platform } from '@/shared/api/generated/model/platform';
import { buildPlaceHref } from './build-place-href';

/**
 * Это хелпер. Собирает id секции материалов платформы на странице места.
 *
 * @param platform - Платформа материалов.
 * @returns Стабильный anchor id для секции платформы.
 */
export function buildPlaceMaterialsAnchor(platform: Platform): string {
  return `materials-${platform}`;
}

/**
 * Это хелпер. Собирает href страницы места с hash секции материалов платформы.
 *
 * @param placeId - Идентификатор места.
 * @param platform - Платформа материалов.
 * @returns Внутренний href до секции материалов платформы.
 */
export function buildPlaceMaterialsHref(placeId: string, platform: Platform): string {
  return `${buildPlaceHref(placeId)}#${buildPlaceMaterialsAnchor(platform)}`;
}
