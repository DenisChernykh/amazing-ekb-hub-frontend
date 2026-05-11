import {
  ListPlacesQueryParams,
  listPlacesQueryPageDefault,
  listPlacesQueryPageSizeDefault,
  listPlacesQueryPageSizeMax,
  listPlacesQuerySortDefault,
} from '@/shared/api/generated-zod/places/places.zod';

type RawSearchParams = Record<string, string | string[] | undefined>;

export type HomeQuery = {
  page: number;
  pageSize: number;
  search?: string;
  sort: 'popular';
  category?: 'pools' | 'spa' | 'cafe' | 'hotels' | 'workshops';
};

/**
 * Это хелпер. Возвращает первое значение query-параметра, если Next передал массив.
 *
 * @param value - Сырое значение query-параметра.
 * @returns Первое строковое значение или `undefined`.
 */
function pickFirst(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Это хелпер. Преобразует строку в положительное целое число.
 *
 * @param value - Сырое строковое значение.
 * @param fallback - Значение по умолчанию.
 * @returns Нормализованное число.
 */
function toBoundedInt(
  value: string | undefined,
  options: { fallback: number; min: number; max?: number },
): number {
  if (!value) return options.fallback;

  const parsed = Number(value);

  if (!Number.isInteger(parsed)) return options.fallback;
  if (parsed < options.min) return options.fallback;
  if (options.max !== undefined && parsed > options.max) return options.fallback;

  return parsed;
}

/**
 * Это хелпер. Обрезает пробелы и убирает пустую строку.
 *
 * @param value - Сырое строковое значение.
 * @returns Непустая строка или `undefined`.
 */
function toTrimmedString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Это хелпер. Проверяет, что строка входит в список допустимых enum-значений.
 *
 * @param value - Сырое строковое значение query-параметра.
 * @param allowed - Допустимые значения.
 * @returns Валидное enum-значение или `undefined`.
 */
function toEnumValue<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | undefined {
  if (!value) return undefined;
  return allowed.includes(value as T) ? (value as T) : undefined;
}

/**
 * Это хелпер.
 *
 * Нормализует query-параметры главной страницы каталога с runtime-ограничениями API-контракта.
 *
 * @param raw - Сырые query-параметры из Next App Router.
 * @returns Безопасные параметры запроса списка мест.
 */
export function normalizeHomeSearchParams(raw: RawSearchParams): HomeQuery {
  const query: HomeQuery = {
    page: toBoundedInt(pickFirst(raw.page), {
      fallback: listPlacesQueryPageDefault,
      min: 1,
    }),
    pageSize: toBoundedInt(pickFirst(raw.pageSize), {
      fallback: listPlacesQueryPageSizeDefault,
      min: 1,
      max: listPlacesQueryPageSizeMax,
    }),
    sort: toEnumValue(pickFirst(raw.sort), ['popular']) ?? listPlacesQuerySortDefault,
  };

  const search = toTrimmedString(pickFirst(raw.search));
  const category = toEnumValue(pickFirst(raw.category), [
    'pools',
    'spa',
    'cafe',
    'hotels',
    'workshops',
  ]);

  if (search) {
    query.search = search;
  }

  if (category) {
    query.category = category;
  }

  const parsed = ListPlacesQueryParams.safeParse(query);

  if (!parsed.success) {
    return {
      page: listPlacesQueryPageDefault,
      pageSize: listPlacesQueryPageSizeDefault,
      sort: listPlacesQuerySortDefault,
    };
  }

  return parsed.data;
}
