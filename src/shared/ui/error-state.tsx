interface ErrorStateProps {
  title: string;
  description?: string;
  issues?: Array<{ path?: string; message: string }>;
  requestId?: string;
}
/**
 * Рендерит базовое inline-состояние ошибки для route-level и page-level сценариев.
 */
export function ErrorState({
  title,
  description,
  issues = [],
  requestId,
}: Readonly<ErrorStateProps>) {
  return (
    <main>
      <h1>{title}</h1>

      {description ? <p>{description}</p> : null}

      {issues.length > 0 ? (
        <ul>
          {issues.map((issue, index) => (
            <li key={`${issue.path ?? 'root'}-${index}`}>
              {issue.path ? `${issue.path}: ` : ''}
              {issue.message}
            </li>
          ))}
        </ul>
      ) : null}

      {requestId ? <p>Request ID: {requestId}</p> : null}
    </main>
  );
}
