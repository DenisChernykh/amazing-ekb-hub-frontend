import type { DomainApiFailure, ValidationApiFailure } from '@/shared/failures/api-failure';
import { getApiIssueMessage } from '@/shared/failures/get-api-issue-message';
import { splitApiIssuesByPath } from '@/shared/failures/split-api-issues-by-path';

/**
 * Возвращает сообщения `root`-ошибок из API `issues`.
 *
 * `Root`-ошибками считаются issues без `path`. Все такие ошибки сохраняются
 * и возвращаются в порядке, заданном backend-ответом.
 *
 * @param failure - Нормализованная API-ошибка с `issues`.
 * @returns Список frontend-сообщений для общего блока ошибок формы.
 */
export function getApiRootIssueMessages(
  failure: ValidationApiFailure | DomainApiFailure,
): string[] {
  const { root } = splitApiIssuesByPath(failure);

  return root.map((issue) => getApiIssueMessage(issue.code));
}
