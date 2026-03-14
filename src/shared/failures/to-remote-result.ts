import type { HttpResult } from '@/shared/api/http-result';
import { getApiErrorEnvelope } from '@/shared/failures/api-error-envelope';
import { createApiFailure, type FailureMeta } from '@/shared/failures/api-failure';
import {
  createInvalidApiErrorEnvelopeFailure,
  createInvalidApiResponseFailure,
  type ContractIssue,
} from '@/shared/failures/contract-failure';
import type { RemoteFailure } from '@/shared/failures/remote-failure';
import { mapTransportErrorToFailure } from '@/shared/failures/transport-failure';
import { resultErr, resultOk, type Result } from '@/shared/lib/result';
import { z } from 'zod';

/**
 * Содержит метаданные успешного remote-вызова после нормализации HTTP-ответа.
 */
export type HttpSuccessMeta = FailureMeta & {
  status: number;
  headers: Headers;
};

/**
 * Нормализует `Promise<HttpResult>` в `Result` с `RemoteFailure` и optional schema-валидацией.
 *
 * @param responsePromise - Сырой результат HTTP-клиента.
 * @param meta - Метаданные endpoint/method для success- и failure-веток.
 * @returns `Result<void, ...>`, если `schema` не передана; иначе `Result` с провалидированным payload.
 */
export function toRemoteResult(
  responsePromise: Promise<HttpResult<unknown, unknown>>,
  meta: Omit<FailureMeta, 'status'>,
): Promise<Result<void, RemoteFailure, HttpSuccessMeta>>;

export function toRemoteResult<TSchema extends z.ZodType>(
  responsePromise: Promise<HttpResult<unknown, unknown>>,
  meta: Omit<FailureMeta, 'status'>,
  schema: TSchema,
): Promise<Result<z.output<TSchema>, RemoteFailure, HttpSuccessMeta>>;

export async function toRemoteResult(
  responsePromise: Promise<HttpResult<unknown, unknown>>,
  meta: Omit<FailureMeta, 'status'>,
  schema?: z.ZodType,
): Promise<Result<unknown, RemoteFailure, HttpSuccessMeta>> {
  try {
    const response = await responsePromise;

    if (!response.ok) {
      return resultErr(
        mapHttpPayloadToFailure({
          status: response.status,
          payload: response.error ?? null,
          meta,
        }),
      );
    }

    const successMeta: HttpSuccessMeta = {
      ...meta,
      status: response.status,
      headers: response.headers,
    };

    if (schema === undefined) {
      return resultOk(undefined, successMeta);
    }

    const parsed = schema.safeParse(response.data);

    if (parsed.success) {
      return resultOk(parsed.data, successMeta);
    }

    return resultErr(
      createInvalidApiResponseFailure({
        meta: { ...meta, status: response.status },
        payload: response.data ?? null,
        issues: mapZodIssues(parsed.error.issues),
      }),
    );
  } catch (error) {
    return resultErr(mapTransportErrorToFailure({ error, meta }));
  }
}
/**
 * Преобразует ошибочный HTTP payload в один из вариантов `RemoteFailure`.
 *
 * Если payload соответствует `STD-001`, возвращается `ApiFailure`.
 * Если envelope невалиден, возвращается `ContractFailure` с кодом
 * `invalidApiErrorEnvelope`.
 *
 * @param args - HTTP status, сырой error payload и метаданные вызова.
 * @returns Нормализованная remote-ошибка.
 */
function mapHttpPayloadToFailure(args: {
  status: number;
  payload: unknown;
  meta: Omit<FailureMeta, 'status'>;
}): RemoteFailure {
  const { status, payload, meta } = args;
  const failureMeta: FailureMeta = { ...meta, status };
  const envelope = getApiErrorEnvelope(payload);

  if (!envelope) {
    return createInvalidApiErrorEnvelopeFailure({
      meta: failureMeta,
      payload,
    });
  }

  return createApiFailure({
    payload: envelope.error,
    meta: failureMeta,
    requestId: envelope.meta?.requestId,
  });
}

type ZodIssues = z.ZodError['issues'];
/**
 * Преобразует `ZodIssue[]` в сериализуемый список contract issues.
 *
 * @param issues - Список ошибок schema-валидации от Zod.
 * @returns Нормализованный массив `ContractIssue` для `invalidApiResponse`.
 */
function mapZodIssues(issues: ZodIssues): ContractIssue[] {
  return issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.map(String).join('.') : '<root>',
    code: issue.code,
    message: issue.message,
  }));
}
