import Link from 'next/link';
import { buildCollectionHref } from '../lib/build-collection-href';
import type { CollectionCardModel } from '../model/types';
import { CollectionCardImage } from './collection-card-image';

function formatPlaceCount(count: number): string {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;
  const word =
    lastTwoDigits >= 11 && lastTwoDigits <= 14
      ? 'мест'
      : lastDigit === 1
        ? 'место'
        : lastDigit >= 2 && lastDigit <= 4
          ? 'места'
          : 'мест';

  return `${count} ${word}`;
}

/** Отображает одну ссылку-карточку публичной подборки. */
export function CollectionCard({
  collection,
  imageLoading = 'lazy',
}: Readonly<{ collection: CollectionCardModel; imageLoading?: 'eager' | 'lazy' }>) {
  return (
    <article className="h-full border border-border bg-white">
      <Link
        href={buildCollectionHref(collection.slug)}
        className="group flex h-full flex-col text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
      >
        <CollectionCardImage
          coverImageUrl={collection.coverImageUrl}
          title={collection.title}
          loading={imageLoading}
        />
        <div className="flex flex-1 flex-col gap-2 px-4 py-5 sm:px-5">
          <h2 className="text-base font-medium transition-colors group-hover:text-card-title-hover group-focus-visible:text-card-title-hover sm:text-lg">
            {collection.title}
          </h2>
          {collection.description && (
            <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
              {collection.description}
            </p>
          )}
          <p className="mt-auto pt-1 text-sm text-muted-foreground">
            {formatPlaceCount(collection.placeCount)}
          </p>
        </div>
      </Link>
    </article>
  );
}
