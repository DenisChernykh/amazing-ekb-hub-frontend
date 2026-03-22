import type { Platform } from '@/entities/material/model/material';

const PLATFORM_LABELS: Record<Platform, string> = {
  dzen: 'Dzen',
  telegram: 'Telegram',
  instagram: 'Instagram',
};

/**
 * Возвращает человекочитаемый лейбл платформы.
 */
export function getPlatformLabel(platform: Platform): string {
  return PLATFORM_LABELS[platform];
}
