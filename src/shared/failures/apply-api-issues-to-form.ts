import type { DomainApiFailure, ValidationApiFailure } from '@/shared/failures/api-failure';
import { getApiIssueMessage } from '@/shared/failures/get-api-issue-message';
import { splitApiIssuesByPath } from '@/shared/failures/split-api-issues-by-path';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

/**
 * Применяет API `issues` к `react-hook-form` по политике `one issue per field`.
 *
 * Helper обрабатывает только field-ошибки с `path`. Если backend вернул несколько
 * issues на один и тот же `path`, используется первый issue в порядке ответа.
 * `root`-ошибки без `path` этот helper не применяет.
 *
 * @typeParam TValues - Тип значений формы.
 * @param form - Экземпляр `react-hook-form`.
 * @param failure - Нормализованная API-ошибка с `issues`.
 * @returns Ничего не возвращает. Ошибки полей записываются через `form.setError(...)`.
 */
export function applyApiIssuesToForm<TValues extends FieldValues>(
  form: UseFormReturn<TValues>,
  failure: ValidationApiFailure | DomainApiFailure,
): void {
  const { fields } = splitApiIssuesByPath(failure);

  for (const [field, issues] of Object.entries(fields)) {
    const issue = issues[0];

    if (!issue) {
      continue;
    }

    form.setError(field as Path<TValues>, {
      type: issue.code,
      message: getApiIssueMessage(issue.code),
    });
  }
}
