import { Skeleton } from '@/shared/ui';

const categoryChipWidths = ['w-12', 'w-20', 'w-24', 'w-16', 'w-28', 'w-20'] as const;

const placeCardSkeletons = [
  { titleWidth: 'w-11/12', subtitleWidth: 'w-7/12', chips: ['w-12', 'w-16'] },
  { titleWidth: 'w-10/12', subtitleWidth: 'w-5/12', chips: ['w-16', 'w-12'] },
  { titleWidth: 'w-11/12', subtitleWidth: 'w-8/12', chips: ['w-14'] },
  { titleWidth: 'w-9/12', subtitleWidth: 'w-6/12', chips: ['w-12', 'w-14'] },
  { titleWidth: 'w-10/12', subtitleWidth: 'w-5/12', chips: ['w-16'] },
  { titleWidth: 'w-11/12', subtitleWidth: 'w-7/12', chips: ['w-14', 'w-12'] },
] as const;

export default function HomeLoading() {
  return (
    <main aria-busy="true" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section aria-label="Загрузка каталога" aria-live="polite" className="w-full" role="status">
        <span className="sr-only">Загрузка...</span>

        <div aria-hidden="true" className="flex flex-col gap-7">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-12 w-40 rounded-lg bg-muted/90 sm:h-14 sm:w-56" />
              <Skeleton className="h-4 w-28 rounded-sm" />
            </div>
            <Skeleton className="h-8 w-32 rounded-full bg-primary/10" />
          </header>

          <div className="rounded-lg border border-border/80 bg-card p-4 shadow-app-card sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Skeleton className="h-11 min-w-0 flex-1 rounded-md bg-muted/80" />
              <Skeleton className="h-11 w-full rounded-md bg-primary/15 sm:w-32" />
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <Skeleton className="h-4 w-24 rounded-sm" />
              <div className="flex flex-wrap gap-2">
                {categoryChipWidths.map((width, index) => (
                  <Skeleton
                    key={`${width}-${index}`}
                    className={`${width} h-7 rounded-full bg-muted/80`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {placeCardSkeletons.map((card, index) => (
              <article
                className="overflow-hidden rounded-lg border border-border/80 bg-card shadow-app-card"
                key={`${card.titleWidth}-${index}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <Skeleton className="size-full rounded-none bg-muted/90" />
                  <Skeleton className="absolute top-3 left-3 h-7 w-24 rounded-full bg-card/75" />
                </div>

                <div className="flex flex-col gap-3 p-4">
                  <div className="flex flex-col gap-2">
                    <Skeleton className={`${card.titleWidth} h-4 rounded-sm bg-muted/90`} />
                    <Skeleton className={`${card.subtitleWidth} h-4 rounded-sm`} />
                  </div>

                  <div className="flex min-h-7 flex-wrap gap-2">
                    {card.chips.map((width, chipIndex) => (
                      <Skeleton
                        key={`${width}-${chipIndex}`}
                        className={`${width} h-6 rounded-full bg-primary/10`}
                      />
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="flex justify-center gap-2 pt-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md bg-primary/15" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </section>
    </main>
  );
}
