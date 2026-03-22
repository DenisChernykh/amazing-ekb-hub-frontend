import type { MaterialType } from '@/entities/material/model/material';

const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  post: 'Пост',
  reel: 'Reel',
  video: 'Видео',
};

/**
 * Возвращает человекочитаемый лейбл типа материала.
 */
export function getMaterialTypeLabel(type: MaterialType): string {
  return MATERIAL_TYPE_LABELS[type];
}
