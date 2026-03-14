/**
 * Описывает сырой результат вызова HTTP-клиента до маппинга в `RemoteFailure`.
 *
 * @typeParam TData - Тип payload в успешной ветке.
 * @typeParam TError - Тип payload в ошибочной HTTP-ветке.
 */
export type HttpResult<TData, TError = unknown> = {
  ok: boolean;
  status: number;
  data?: TData;
  error?: TError;
  headers: Headers;
};
