'use client';

import { RetryableRouteError } from '@/shared/ui';

/** Показывает recoverable error boundary detail-страницы подборки. */
export default function CollectionError({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  void error;

  return (
    <RetryableRouteError
      title="Не удалось загрузить подборку"
      description="Попробуйте запросить данные ещё раз."
      retry={reset}
    />
  );
}
