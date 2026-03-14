/**
 * Универсальный result-first контракт для data-access и сценариев.
 *
 * @typeParam TData - Тип успешных данных.
 * @typeParam TError - Тип ошибки.
 * @typeParam TMeta - Тип метаданных успеха.
 */
export type Result<TData, TError, TMeta> =
  | { ok: true; data: TData; meta: TMeta }
  | { ok: false; error: TError };

/**
 * Создает успешную ветку `Result`.
 *
 * @typeParam TData - Тип успешных данных.
 * @typeParam TMeta - Тип метаданных успеха.
 * @param data - Payload успешного результата.
 * @param meta - Метаданные успешного результата.
 * @returns `Result` с `ok: true`.
 */
export function resultOk<TData, TMeta>(data: TData, meta: TMeta): Result<TData, never, TMeta> {
  return { ok: true, data, meta };
}

/**
 * Создает failure-ветку `Result`.
 *
 * @typeParam TError - Тип ошибки.
 * @param error - Typed ошибка операции.
 * @returns `Result` с `ok: false`.
 */
export function resultErr<TError>(error: TError): Result<never, TError, never> {
  return { ok: false, error };
}

/**
 * Извлекает данные из успешного `Result` или бросает ошибку.
 *
 * @typeParam TData - Тип успешных данных.
 * @typeParam TError - Тип ошибки.
 * @typeParam TMeta - Тип метаданных успеха.
 * @param result - Result-first ответ операции.
 * @returns `data`, если `result.ok === true`.
 */
export function resultToDataOrThrow<TData, TError, TMeta>(
  result: Result<TData, TError, TMeta>,
): TData {
  if (result.ok) {
    return result.data;
  }

  throw result.error;
}
