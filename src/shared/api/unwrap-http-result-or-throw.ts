import type { HttpResult } from '@/shared/api/http-result';
import { z } from 'zod';
import {
  ApiContractError,
  ApiHttpError,
  type ApiContractDiagnosticIssue,
} from './api-runtime-error';

/**
 * Разворачивает `HttpResult` в success payload или бросает типизированную ошибку.
 *
 * @param responsePromise - Сырой результат HTTP-клиента.
 * @returns `void`, если schema не передана и ответ успешен.
 */
export function unwrapHttpResultOrThrow(
  responsePromise: Promise<HttpResult<unknown, unknown>>,
): Promise<void>;

/**
 * Разворачивает `HttpResult` в провалидированный success payload или бросает типизированную ошибку.
 *
 * @typeParam TSchema - Zod-схема успешного payload.
 * @param responsePromise - Сырой результат HTTP-клиента.
 * @param schema - Runtime-схема успешного ответа.
 * @returns Провалидированный success payload.
 */
export function unwrapHttpResultOrThrow<TSchema extends z.ZodType>(
  responsePromise: Promise<HttpResult<unknown, unknown>>,
  schema: TSchema,
): Promise<z.output<TSchema>>;

export async function unwrapHttpResultOrThrow(
  responsePromise: Promise<HttpResult<unknown, unknown>>,
  schema?: z.ZodType,
): Promise<unknown> {
  const response = await responsePromise;

  if (!response.ok) {
    throw new ApiHttpError({
      status: response.status,
      headers: response.headers,
      body: response.error ?? null,
    });
  }

  if (schema === undefined) {
    return undefined;
  }

  const parsedPayload = schema.safeParse(response.data);

  if (parsedPayload.success) {
    return parsedPayload.data;
  }

  throw new ApiContractError({
    status: response.status,
    headers: response.headers,
    body: response.data ?? null,
    issues: mapZodIssues(parsedPayload.error.issues),
  });
}

/**
 * Преобразует `ZodIssue[]` в сериализуемый список contract diagnostics.
 *
 * @param issues - Ошибки schema-валидации.
 * @returns Нормализованный список contract diagnostics.
 */
function mapZodIssues(issues: z.ZodError['issues']): ApiContractDiagnosticIssue[] {
  return issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.map(String).join('.') : '<root>',
    code: issue.code,
    message: issue.message,
  }));
}
