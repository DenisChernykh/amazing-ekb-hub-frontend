import type { Platform } from '@/shared/api/generated/model/platform';

const MATERIAL_URL_ALLOWED_HOSTS: Record<Platform, readonly string[]> = {
  dzen: ['dzen.ru', 'www.dzen.ru'],
  telegram: ['t.me'],
  instagram: ['instagram.com', 'www.instagram.com'],
};

/**
 * Это хелпер. Нормализует material URL и отбрасывает небезопасные внешние ссылки.
 *
 * @param rawUrl - URL из backend material DTO.
 * @param platform - Платформа материала.
 * @returns Безопасный URL для внешней ссылки или `null`.
 */
export function normalizeMaterialUrl(rawUrl: string, platform: Platform): string | null {
  try {
    const url = new URL(rawUrl);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }

    const allowedHosts = MATERIAL_URL_ALLOWED_HOSTS[platform];

    if (!allowedHosts.includes(url.hostname.toLowerCase())) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}
