import { PlaceCard, type PlaceCardModel } from '@/entities/place/client';
import { chunkPlaceCards } from '../lib/chunk-place-cards';

export function PlaceFeed({ items }: Readonly<{ items: PlaceCardModel[] }>) {
  return (
    <section aria-label="Места" className="flex flex-col gap-5">
      {chunkPlaceCards(items).map((module) => (
        <div className="place-feed-module" key={module[0]?.id}>
          {module.map((place, index) => (
            <div className={index === 0 ? 'place-feed-module-tall' : undefined} key={place.id}>
              <PlaceCard place={place} variant={index === 0 ? 'tall' : 'regular'} />
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
