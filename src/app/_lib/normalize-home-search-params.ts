type RawSearchParams = Record<string, string | string[] | undefined>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

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
function toPositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;

  const parsed = Number(value);

  if (!Number.isInteger(parsed)) return fallback;
  if (parsed < 1) return fallback;

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
 * Это хелпер.
 *
 * Нормализует query-параметры главной страницы каталога без runtime-валидации.
 *
 * @param raw - Сырые query-параметры из Next App Router.
 * @returns Безопасные параметры запроса списка мест.
 */
export function normalizeHomeSearchParams(raw: RawSearchParams): HomeQuery {
  return {
    page: toPositiveInt(pickFirst(raw.page), DEFAULT_PAGE),
    pageSize: toPositiveInt(pickFirst(raw.pageSize), DEFAULT_PAGE_SIZE),
    search: toTrimmedString(pickFirst(raw.search)),
    sort: 'popular',
    category: pickFirst(raw.category) as HomeQuery['category'],
  };
}
