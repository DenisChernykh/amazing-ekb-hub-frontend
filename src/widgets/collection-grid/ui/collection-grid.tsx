import { CollectionCard, type CollectionCardModel } from '@/entities/collection';

/** Отображает адаптивную сетку публичных подборок и её empty state. */
export function CollectionGrid({
  collections,
  ariaLabel,
}: Readonly<{ collections: CollectionCardModel[]; ariaLabel: string }>) {
  if (collections.length === 0) {
    return (
      <section aria-label={ariaLabel}>
        <p className="border border-border bg-white px-5 py-8 text-muted-foreground">
          Подборок пока нет.
        </p>
      </section>
    );
  }

  return (
    <section aria-label={ariaLabel}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {collections.map((collection, index) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            imageLoading={index < 4 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
    </section>
  );
}
