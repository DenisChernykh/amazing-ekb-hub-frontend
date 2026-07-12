import {
  listPlacesQueryPageDefault,
  listPlacesQueryPageMax,
  listPlacesQueryPageSizeDefault,
  listPlacesQueryPageSizeMax,
  listPlacesQuerySearchMax,
  listPlacesQuerySortDefault,
} from '@/shared/api/generated-zod/places/places.zod';

type RawSearchParams = Record<string, string | string[] | undefined>;

export type HomeQuery = {
  page: number;
  pageSize: number;
  search?: string;
  sort: 'popular' | 'title_asc';
  category?: string;
};

const CATEGORY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
  return trimmed && trimmed.length <= listPlacesQuerySearchMax ? trimmed : undefined;
}

function toEnumValue<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | undefined {
  if (!value) return undefined;
  return allowed.includes(value as T) ? (value as T) : undefined;
}

/**
 * Это хелпер. Проверяет публичный slug категории из URL.
 *
 * @param value - Сырое строковое значение query-параметра.
 * @returns Безопасный slug или `undefined`.
 */
function toCategorySlug(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return CATEGORY_SLUG_PATTERN.test(value) ? value : undefined;
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
      max: listPlacesQueryPageMax,
    }),
    pageSize: toBoundedInt(pickFirst(raw.pageSize), {
      fallback: listPlacesQueryPageSizeDefault,
      min: 1,
      max: listPlacesQueryPageSizeMax,
    }),
    sort: toEnumValue(pickFirst(raw.sort), ['popular', 'title_asc']) ?? listPlacesQuerySortDefault,
  };

  const search = toTrimmedString(pickFirst(raw.search));
  const category = toCategorySlug(pickFirst(raw.category));

  if (search) {
    query.search = search;
  }

  if (category) {
    query.category = category;
  }

  return query;
}
