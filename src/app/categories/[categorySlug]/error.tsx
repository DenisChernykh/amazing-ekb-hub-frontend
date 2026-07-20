'use client';

import { Container } from '@/shared/ui';

export default function CategoryError({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  void error;

  return (
    <Container as="main" className="py-12">
      <section className="flex min-h-48 flex-col items-start justify-center gap-5">
        <h1 className="text-2xl font-medium text-black">Не удалось загрузить категорию</h1>
        <p className="text-muted-foreground">Попробуйте запросить данные ещё раз.</p>
        <button
          type="button"
          onClick={reset}
          className="border border-black bg-black px-5 py-3 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
        >
          Повторить
        </button>
      </section>
    </Container>
  );
}
