import { isPlaceCategory, type PlaceCategory } from '../entity';
import {
  DEFAULT_PLACE_LIST_PARAMS,
  type BuildPlaceListParamsInput,
  type ListPlacesParams,
} from './place-list-query.types';

/**
 * Собирает canonical query params списка мест.
 *
 * @param input - Частично нормализованные route/UI значения.
 * @returns Полный backend-ready shape для `GET /places`.
 */
export function buildPlaceListParams(input: BuildPlaceListParamsInput): ListPlacesParams {
  const search = normalizeOptionalString(input.search);
  const category = parsePlaceCategory(input.category);

  return {
    ...DEFAULT_PLACE_LIST_PARAMS,
    ...(input.page ? { page: input.page } : {}),
    ...(search ? { search } : {}),
    ...(category ? { category } : {}),
  };
}

/**
 * Нормализует категорию места из строкового значения.
 *
 * @param value - Сырое значение категории.
 * @returns Валидную категорию места или `undefined`.
 */
function parsePlaceCategory(value: string | undefined): PlaceCategory | undefined {
  if (!value) {
    return undefined;
  }

  return isPlaceCategory(value) ? value : undefined;
}

/**
 * Обрезает строку и отбрасывает пустое значение.
 *
 * @param value - Сырое строковое значение.
 * @returns Непустую строку или `undefined`.
 */
function normalizeOptionalString(value: string | undefined): string | undefined {
  const normalizedValue = value?.trim();

  return normalizedValue && normalizedValue.length > 0 ? normalizedValue : undefined;
}
