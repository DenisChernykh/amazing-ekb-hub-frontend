/**
 * Представляет ошибку, которую может выбросить сгенерированный API-клиент.
 *
 * @remarks
 * Помимо стандартного `Error`, объект может содержать HTTP-статус в `status`
 * и распарсенный payload удалённой ошибки в `info`.
 */
export type GeneratedApiError = Error & {
  status?: number;
  info?: unknown;
};
/**
 * Проверяет, что значение из `catch` похоже на ошибку generated API client.
 *
 * @param value - Неизвестное значение, перехваченное в `catch`.
 * @returns `true`, если значение можно безопасно трактовать как `GeneratedApiError`.
 */
export function isGeneratedApiError(value: unknown): value is GeneratedApiError {
  return value instanceof Error && ('status' in value || 'info' in value);
}
