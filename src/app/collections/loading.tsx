import { Container } from '@/shared/ui';

/** Показывает стабильный skeleton списка подборок во время server navigation. */
export default function CollectionsLoading() {
  return (
    <Container as="main" className="py-10 sm:py-14 lg:py-16" aria-busy="true">
      <div className="mb-8 h-10 w-48 animate-pulse bg-muted motion-reduce:animate-none" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="aspect-[4/3] animate-pulse border border-border bg-muted motion-reduce:animate-none"
          />
        ))}
      </div>
    </Container>
  );
}
