import type { HttpResult } from '@/shared/api/http-result';
import { z } from 'zod';
import { unwrapHttpResultOrThrow } from './unwrap-http-result-or-throw';

/**
 * Разворачивает сырой `HttpResult`, валидирует success payload и сразу маппит его.
 *
 * @typeParam TSchema - Runtime-схема успешного payload.
 * @typeParam TResult - Тип итоговой mapped-модели.
 * @param responsePromise - Сырой результат HTTP-клиента.
 * @param schema - Runtime-схема успешного ответа.
 * @param mapper - Преобразование провалидированного DTO в итоговую модель.
 * @returns Итоговую mapped-модель.
 */
export async function unwrapHttpResultAndMapOrThrow<TSchema extends z.ZodType, TResult>(
  responsePromise: Promise<HttpResult<unknown, unknown>>,
  schema: TSchema,
  mapper: (payload: z.output<TSchema>) => TResult,
): Promise<TResult> {
  const responseDto = await unwrapHttpResultOrThrow(responsePromise, schema);

  return mapper(responseDto);
}
