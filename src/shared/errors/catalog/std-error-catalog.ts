/**
 * Канонический каталог пользовательских сообщений для `std-errors`.
 *
 * @remarks
 * `catalogKey` приходит из policy-слоя и не должен напрямую отображать
 * raw backend `message`. Этот каталог является проектным источником истины
 * только для generic route-level expected failure UI.
 */
export const STD_ERROR_CATALOG = {
  'std.validation.generic': {
    title: 'Не удалось обработать запрос',
    description: 'Проверьте введенные данные и попробуйте снова.',
  },
  'std.domain.generic': {
    title: 'Не удалось завершить операцию',
    description: 'Запрос противоречит бизнес-правилам. Попробуйте изменить действие.',
  },
  'std.auth.generic': {
    title: 'Требуется авторизация',
    description: 'Войдите в аккаунт и повторите попытку.',
  },
  'std.permission.generic': {
    title: 'Недостаточно прав',
    description: 'У вас нет доступа к этому разделу или действию.',
  },
  'std.notFound.generic': {
    title: 'Ничего не найдено',
    description: 'Запрошенный ресурс недоступен или больше не существует.',
  },
} as const;

/**
 * Допустимый ключ каталога пользовательских сообщений `std-errors`.
 */
export type StdErrorCatalogKey = keyof typeof STD_ERROR_CATALOG;

/**
 * UI-модель одного сообщения каталога `std-errors`.
 */
export type StdErrorCatalogEntry = {
  title: string;
  description: string;
};

const FALLBACK_STD_ERROR_CATALOG_ENTRY: StdErrorCatalogEntry = {
  title: 'Что-то пошло не так',
  description: 'Попробуйте повторить действие позже.',
};

/**
 * Возвращает generic пользовательское сообщение для `catalogKey`.
 *
 * @param catalogKey - Ключ из policy-слоя.
 * @returns Generic сообщение каталога или безопасный fallback.
 */
export function getStdErrorCatalogEntry(catalogKey: string): StdErrorCatalogEntry {
  if (catalogKey in STD_ERROR_CATALOG) {
    return STD_ERROR_CATALOG[catalogKey as StdErrorCatalogKey];
  }

  return FALLBACK_STD_ERROR_CATALOG_ENTRY;
}
