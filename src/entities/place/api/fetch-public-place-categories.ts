import {
  listPlaceCategories,
  type listPlaceCategoriesResponseSuccess,
} from '@/shared/api/generated/places/places';

/**
 * Нормализованный результат загрузки публичного справочника категорий.
 */
export type FetchPublicPlaceCategoriesResult =
  | { kind: 'success'; data: listPlaceCategoriesResponseSuccess['data'] }
  | { kind: 'unexpected_error'; message: string };

/**
 * Загружает публичный справочник категорий для фильтров и бейджей.
 *
 * @returns Результат загрузки со штатной success-веткой или технической ошибкой.
 */
export async function fetchPublicPlaceCategories(): Promise<FetchPublicPlaceCategoriesResult> {
  try {
    const response = await listPlaceCategories({
      cache: 'no-store',
    });

    return {
      kind: 'success',
      data: response.data,
    };
  } catch {
    return {
      kind: 'unexpected_error',
      message: 'Не удалось загрузить категории мест.',
    };
  }
}
