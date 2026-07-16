import { Container, Skeleton } from '@/shared/ui';

export default function Loading() {
  return (
    <Container as="main" aria-busy="true" className="flex py-8 sm:py-12">
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
    </Container>
  );
}
