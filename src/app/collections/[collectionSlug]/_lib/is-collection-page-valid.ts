/**
 * Проверяет, существует ли запрошенная страница подборки для текущего total.
 *
 * @param page - Положительный номер запрошенной страницы.
 * @param pageSize - Размер страницы backend-ответа.
 * @param total - Общее количество мест в подборке.
 * @returns `true` для существующей страницы; у пустой подборки существует только страница 1.
 */
export function isCollectionPageValid(page: number, pageSize: number, total: number): boolean {
  if (total === 0) return page === 1;
  return page <= Math.ceil(total / pageSize);
}
