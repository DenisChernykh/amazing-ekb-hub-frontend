import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { CircleAlertIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface ErrorStateProps {
  title: string;
  description?: string;
  issues?: Array<{ path?: string; message: string }>;
  requestId?: string;
  action?: ReactNode;
}
/**
 * Рендерит базовое inline-состояние ошибки для route-level и page-level сценариев.
 */
export function ErrorState({
  title,
  description,
  issues = [],
  requestId,
  action,
}: Readonly<ErrorStateProps>) {
  const hasDetails =
    Boolean(description) || issues.length > 0 || Boolean(requestId) || Boolean(action);
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Alert variant="destructive">
        <CircleAlertIcon aria-hidden="true" />
        <AlertTitle>{title}</AlertTitle>

        {hasDetails && (
          <AlertDescription className="flex flex-col gap-3">
            {description && <p>{description}</p>}

            {issues.length > 0 && (
              <ul className="flex list-disc flex-col gap-1 pl-5">
                {issues.map((issue, index) => (
                  <li key={`${issue.path ?? 'root'}-${index}`}>
                    {issue.path ? `${issue.path}: ${issue.message}` : issue.message}
                  </li>
                ))}
              </ul>
            )}

            {requestId && <p>Request ID: {requestId}</p>}

            {action}
          </AlertDescription>
        )}
      </Alert>
    </main>
  );
}
