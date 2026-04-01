import { buildMaterialMetaChips, type Material } from '@/modules/material';
import type { PlaceDetailMaterialViewModel } from './place-detail-section.view-model.types';

/**
 * Преобразует доменный материал в presentation-ready элемент detail-секции.
 *
 * @param material - Доменная модель материала.
 * @returns View model одного элемента секции.
 */
export function mapMaterialToDetailItemViewModel(material: Material): PlaceDetailMaterialViewModel {
  return {
    id: material.id,
    title: material.title,
    href: material.url,
    metaChips: buildMaterialMetaChips(material),
  };
}
