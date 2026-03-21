/**
 * Одно значение query-параметра в формате Next App Router.
 */
export type SearchParamValue = string | string[] | undefined;

/**
 * Достаёт одно строковое значение из Next `searchParams`.
 *
 * @param value - Значение query-параметра в формате App Router.
 * @returns Непустую строку или `undefined`, если параметр отсутствует или пуст.
 */
export function getSingleSearchParam(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    const firstValue = value[0]?.trim();

    return firstValue && firstValue.length > 0 ? firstValue : undefined;
  }

  const normalizedValue = value?.trim();

  return normalizedValue && normalizedValue.length > 0 ? normalizedValue : undefined;
}

/**
 * Нормализует номер страницы из query-параметра.
 *
 * @param value - Строковое значение `page`.
 * @returns Положительный целый номер страницы или `undefined`, если значение невалидно.
 */
export function parsePositivePage(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return undefined;
  }

  return parsedValue;
}
