import { CollectionCardImage } from '@/entities/collection';
import type { PlaceCardModel } from '@/entities/place';
import { CollectionPagination } from '@/features/collection-pagination';
import { Container } from '@/shared/ui';
import { PlaceFeed } from '@/widgets/place-feed';
import Link from 'next/link';
import type { CollectionDetailViewModel } from '../_lib/get-collection-page-data';

/** Собирает заголовок, optional cover/description и упорядоченную ленту мест подборки. */
export function CollectionPageContent({
  collection,
  places,
  page,
  pageSize,
  total,
}: Readonly<{
  collection: CollectionDetailViewModel;
  places: PlaceCardModel[];
  page: number;
  pageSize: number;
  total: number;
}>) {
  return (
    <Container as="main" className="py-8 sm:py-12 lg:py-14">
      <nav aria-label="Хлебные крошки" className="mb-6 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/"
              className="hover:text-black focus-visible:outline-2 focus-visible:outline-black"
            >
              Главная
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/collections"
              className="hover:text-black focus-visible:outline-2 focus-visible:outline-black"
            >
              Подборки
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-black">
            {collection.title}
          </li>
        </ol>
      </nav>

      <header className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] lg:items-start">
        <div>
          <h1 className="mb-3 text-3xl font-medium text-black sm:text-4xl">{collection.title}</h1>
          {collection.description && (
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              {collection.description}
            </p>
          )}
        </div>
        {collection.coverImageUrl && (
          <CollectionCardImage
            coverImageUrl={collection.coverImageUrl}
            title={collection.title}
            loading="eager"
          />
        )}
      </header>

      {places.length > 0 ? (
        <PlaceFeed items={places} />
      ) : (
        <p className="py-12 text-base text-muted-foreground">В этой подборке пока нет мест.</p>
      )}

      <CollectionPagination
        collectionSlug={collection.slug}
        page={page}
        pageSize={pageSize}
        total={total}
      />
    </Container>
  );
}
