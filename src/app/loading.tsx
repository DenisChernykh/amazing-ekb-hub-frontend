import { Skeleton } from '@/shared/ui';

export default function Loading() {
  return (
    <main
      aria-busy="true"
      className="mx-auto flex w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
    >
      <section
        aria-label="Загрузка"
        aria-live="polite"
        className="flex min-h-60 w-full flex-col items-center justify-center gap-4 text-center"
        role="status"
      >
        <Skeleton aria-hidden="true" className="size-8 rounded-full" />
        <div className="flex flex-col items-center gap-2">
          <Skeleton aria-hidden="true" className="h-4 w-28" />
          <span className="text-sm text-muted-foreground">Загрузка...</span>
        </div>
      </section>
    </main>
  );
}
