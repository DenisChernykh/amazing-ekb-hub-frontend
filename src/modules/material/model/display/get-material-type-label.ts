import { MaterialType } from '@/modules/material/model/entity';

const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  post: 'Пост',
  reel: 'Reel',
  video: 'Видео',
};

/**
 * Возвращает человекочитаемый лейбл типа материала.
 *
 * @param type - Тип материала.
 * @returns Лейбл типа материала для UI.
 */
export function getMaterialTypeLabel(type: MaterialType): string {
  return MATERIAL_TYPE_LABELS[type];
}
