'use client';

import { ErrorState } from '@/shared/ui/error-state';

/** Показывает route-level fallback и позволяет повторить загрузку подборок. */
export default function CollectionsError({
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <div>
      <ErrorState
        title="Не удалось загрузить подборки"
        description="Попробуйте обновить страницу."
      />
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
        >
          Повторить
        </button>
      </div>
    </div>
  );
}
