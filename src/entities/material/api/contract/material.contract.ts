import { ListPlaceMaterialsParams, MaterialList } from '@/entities/material/model/material';
import { HttpSuccessMeta, RemoteFailure } from '@/shared/failures';
import { Result } from '@/shared/lib/result';

/**
 * Result-first ответ списка материалов места.
 */
export type MaterialListResult = Result<MaterialList, RemoteFailure, HttpSuccessMeta>;
/**
 * Контракт data-access слоя сущности `material`.
 */
export interface MaterialApi {
  /**
   * Загружает материалы конкретного места внутри выбранной платформы.
   *
   * @param params - Параметры backend-запроса.
   * @returns Result-first ответ списка материалов.
   */
  listByPlace(params: ListPlaceMaterialsParams): Promise<MaterialListResult>;
}
