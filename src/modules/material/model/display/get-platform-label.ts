import { Platform } from '@/modules/material/model/entity';

const PLATFORM_LABELS: Record<Platform, string> = {
  dzen: 'Dzen',
  telegram: 'Telegram',
  instagram: 'Instagram',
};

/**
 * Возвращает человекочитаемый лейбл платформы.
 *
 * @param platform - Платформа материала.
 * @returns Лейбл платформы для UI.
 */
export function getPlatformLabel(platform: Platform): string {
  return PLATFORM_LABELS[platform];
}
