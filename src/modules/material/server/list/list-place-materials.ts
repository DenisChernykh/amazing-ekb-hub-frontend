import 'server-only';

import type { ListPlaceMaterialsParams, MaterialList } from '@/modules/material/model';
import { createServerMaterialApi } from '../factory';

/**
 * Загружает материалы места для одной платформы и одной страницы.
 *
 * @param params - Идентификатор места, платформа и номер страницы.
 * @returns Доменную модель списка материалов.
 *
 * @remarks
 * Метод использует throw-based API-контур и предназначен для RSC/route loaders.
 */
export async function listPlaceMaterials(params: ListPlaceMaterialsParams): Promise<MaterialList> {
  const materialApi = await createServerMaterialApi();

  return materialApi.listByPlace(params);
}
