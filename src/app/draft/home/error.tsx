'use client';

import { RouteFatalErrorState } from '@/shared/errors';

/**
 * Пропсы route-level error boundary draft home-страницы.
 */
interface DraftHomeErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Route-level fatal error boundary для draft home-страницы.
 *
 * @param props - Ошибка сегмента и reset callback.
 * @returns Клиентский fatal error state.
 */
export default function DraftHomeError({ error, reset }: Readonly<DraftHomeErrorProps>) {
  return (
    <RouteFatalErrorState
      error={error}
      reset={reset}
      titleOverride="Не удалось открыть draft home"
      descriptionOverride="Во время загрузки новой home-страницы произошел непредвиденный сбой."
    />
  );
}
