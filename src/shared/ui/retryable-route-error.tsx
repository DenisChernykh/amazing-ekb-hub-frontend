'use client';

import { Button } from './button';
import { ErrorState } from './error-state';

/**
 * Единообразно показывает ошибку route segment и действие повторной загрузки.
 *
 * @param title - Краткий заголовок ошибки.
 * @param description - Пояснение следующего безопасного действия.
 * @param retry - Callback Next.js error boundary для повторного render segment.
 */
export function RetryableRouteError({
  title,
  description,
  retry,
}: Readonly<{ title: string; description: string; retry: () => void }>) {
  return (
    <ErrorState
      title={title}
      description={description}
      action={
        <Button type="button" onClick={retry}>
          Повторить
        </Button>
      }
    />
  );
}
