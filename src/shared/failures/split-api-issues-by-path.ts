import type { ApiDomainIssue, ApiValidationIssue } from '@/shared/failures/api-error-envelope';
import type { DomainApiFailure, ValidationApiFailure } from '@/shared/failures/api-failure';

type ApiPathIssue = ApiValidationIssue | ApiDomainIssue;

/**
 * Нормализованный результат разбиения API issues по field- и root-областям формы.
 */
export type SplitApiIssuesByPathResult = {
  fields: Readonly<Record<string, ApiPathIssue[]>>;
  root: readonly ApiPathIssue[];
};

/**
 * Разбивает `validation` и `domain` issues по `path` для последующего применения в форме.
 *
 * Issues с непустым `path` попадают в `fields[path]`, issues без `path` — в `root`.
 *
 * @param failure - Нормализованная API-ошибка с `issues`.
 * @returns Объект с field-issues и root-issues. Если `issues` нет, обе коллекции пустые.
 */
export function splitApiIssuesByPath(
  failure: ValidationApiFailure | DomainApiFailure,
): SplitApiIssuesByPathResult {
  const fields: Record<string, ApiPathIssue[]> = {};
  const root: ApiPathIssue[] = [];

  for (const issue of failure.issues ?? []) {
    if (!issue.path) {
      root.push(issue);
      continue;
    }

    const fieldIssues = fields[issue.path];

    if (fieldIssues) {
      fieldIssues.push(issue);
      continue;
    }

    fields[issue.path] = [issue];
  }

  return { fields, root };
}
