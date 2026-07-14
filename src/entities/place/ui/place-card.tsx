import { Card, CardContent } from '@/shared/ui';
import Link from 'next/link';
import { buildPlaceHref } from '../lib/build-place-href';
import type { PlaceCardModel } from '../model/types';
import { PlaceCardBadges } from './place-card-badges';
import { PlaceCardImage } from './place-card-image';

interface PlaceCardProps {
  place: PlaceCardModel;
}

/**
 * Рендерит кликабельную карточку места.
 *
 * @param props - Данные карточки места.
 */
export function PlaceCard({ place }: Readonly<PlaceCardProps>) {
  const placeHref = buildPlaceHref(place.id);

  return (
    <Card className="h-full gap-0 py-0 shadow-app-card hover:ring-primary/35 hover:shadow-app-card-hover focus-within:ring-primary/35 focus-within:shadow-app-card-focus motion-safe:transition-[transform,translate,box-shadow] motion-safe:duration-[180ms] motion-safe:ease-out motion-safe:hover:-translate-y-1 motion-safe:focus-within:-translate-y-1">
      <Link
        href={placeHref}
        className="block focus-visible:z-[1] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-inset"
      >
        <PlaceCardImage category={place.category} src={place.coverImageUrl} title={place.title} />
      </Link>

      <CardContent className="flex min-h-28 w-full flex-col gap-2.5 p-3.5">
        <p className="line-clamp-2 text-[clamp(1.05rem,0.9rem+0.45vw,1.28rem)] leading-[1.18] font-bold text-card-foreground">
          <Link
            href={placeHref}
            className="rounded-sm text-inherit no-underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            {place.title}
          </Link>
        </p>
        <PlaceCardBadges place={place} />
      </CardContent>
    </Card>
  );
}
