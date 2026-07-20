import { cn } from '@/shared/lib/utils';
import Link from 'next/link';
import { buildPlaceHref } from '../lib/build-place-href';
import type { PlaceCardModel, PlaceCardVariant } from '../model/types';
import { PlaceCardImage } from './place-card-image';

/** Отображает ссылку-карточку публичного места. */
export function PlaceCard({
  place,
  variant,
}: Readonly<{ place: PlaceCardModel; variant: PlaceCardVariant }>) {
  return (
    <article className="h-full border border-border bg-white">
      <Link
        href={buildPlaceHref(place.slug)}
        className="group flex h-full flex-col text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
      >
        <PlaceCardImage src={place.coverImageUrl} variant={variant} />
        <h2
          className={cn(
            'px-4 py-4 font-medium transition-colors group-hover:text-card-title-hover group-focus-visible:text-card-title-hover sm:px-5',
            variant === 'tall' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg',
          )}
        >
          {place.title}
        </h2>
      </Link>
    </article>
  );
}
