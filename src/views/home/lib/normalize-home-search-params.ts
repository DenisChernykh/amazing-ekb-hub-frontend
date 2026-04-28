import {
  ListPlacesQueryParams,
  listPlacesQueryPageDefault,
  listPlacesQueryPageSizeDefault,
  listPlacesQueryPageSizeMax,
  listPlacesQuerySortDefault,
} from '@/shared/api/generated-zod/places/places.zod';

type RawSearchParams = Record<string, string | string[] | undefined>;
/**
 * Нормализованные query-параметры домашней страницы каталога мест.
 */
export type HomeQuery = {
  page: number;
  pageSize: number;
  search?: string;
  sort: 'popular';
  category?: 'pools' | 'spa' | 'cafe' | 'hotels' | 'workshops';
};
/**
 * Возвращает первое значение query-параметра, если Next передал массив.
 *
 * @param value - Сырое значение query-параметра.
 * @returns Первое строковое значение или `undefined`, если параметр отсутствует.
 */
function pickFirst(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
/**
 * Преобразует строку в положительное целое число с fallback-значением.
 *
 * @param value - Сырое строковое значение query-параметра.
 * @param options - Ограничения диапазона и значение по умолчанию.
 * @returns Нормализованное целое число в допустимом диапазоне.
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
 * Обрезает пробелы по краям и убирает пустую строку.
 *
 * @param value - Сырое строковое значение query-параметра.
 * @returns Непустую строку без лишних пробелов или `undefined`.
 */
function toTrimmedString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
/**
 * Проверяет, что строка входит в список допустимых enum-значений.
 *
 * @param value - Сырое строковое значение query-параметра.
 * @param allowed - Допустимые значения.
 * @returns Валидное enum-значение или `undefined`, если значение не разрешено.
 */
function toEnumValue<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | undefined {
  if (!value) return undefined;
  return allowed.includes(value as T) ? (value as T) : undefined;
}
/**
 * Нормализует сырые `searchParams` домашней страницы и подставляет безопасные fallback-значения.
 *
 * @param raw - Сырые query-параметры из Next App Router.
 * @returns Нормализованный query-объект, безопасный для server-side запроса списка мест.
 */
export function normalizeHomeSearchParams(raw: RawSearchParams): HomeQuery {
  const candidate = {
    page: toBoundedInt(pickFirst(raw.page), {
      fallback: listPlacesQueryPageDefault,
      min: 1,
    }),
    pageSize: toBoundedInt(pickFirst(raw.pageSize), {
      fallback: listPlacesQueryPageSizeDefault,
      min: 1,
      max: listPlacesQueryPageSizeMax,
    }),
    search: toTrimmedString(pickFirst(raw.search)),
    sort: toEnumValue(pickFirst(raw.sort), ['popular']) ?? listPlacesQuerySortDefault,
    category: toEnumValue(pickFirst(raw.category), ['pools', 'spa', 'cafe', 'hotels', 'workshops']),
  };

  const parsed = ListPlacesQueryParams.safeParse(candidate);

  if (!parsed.success) {
    return {
      page: listPlacesQueryPageDefault,
      pageSize: listPlacesQueryPageSizeDefault,
      sort: listPlacesQuerySortDefault,
    };
  }

  return parsed.data;
}
