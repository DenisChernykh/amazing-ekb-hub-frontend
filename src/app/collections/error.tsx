'use client';

import { RetryableRouteError } from '@/shared/ui';

/** Показывает route-level fallback и позволяет повторить загрузку подборок. */
export default function CollectionsError({
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <RetryableRouteError
      title="Не удалось загрузить подборки"
      description="Попробуйте обновить страницу."
      retry={reset}
    />
  );
}
