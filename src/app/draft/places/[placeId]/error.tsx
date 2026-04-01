'use client';

import { RouteFatalErrorState } from '@/shared/errors';

/**
 * Пропсы route-level error boundary draft detail-страницы.
 */
interface DraftPlaceDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Route-level fatal error boundary для draft detail-страницы.
 *
 * @param props - Ошибка сегмента и reset callback.
 * @returns Клиентский fatal error state.
 */
export default function DraftPlaceDetailError({
  error,
  reset,
}: Readonly<DraftPlaceDetailErrorProps>) {
  return (
    <RouteFatalErrorState
      error={error}
      reset={reset}
      titleOverride="Не удалось открыть draft detail"
      descriptionOverride="Во время загрузки новой detail-страницы произошел непредвиденный сбой."
    />
  );
}
