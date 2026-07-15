import { Badge } from '@/shared/ui';
import Link from 'next/link';
import { buildPlaceMaterialsHref } from '../lib/build-place-materials-href';
import { getPlatformDisplay, getVisiblePlatformCounters } from '../model/place-display';
import type { PlaceCardModel } from '../model/types';

interface PlaceCardBadgesProps {
  place: PlaceCardModel;
}

/**
 * Рендерит platform/count бейджи карточки.
 *
 * @param props - Данные карточки места.
 */
export function PlaceCardBadges({ place }: Readonly<PlaceCardBadgesProps>) {
  const platformCounters = getVisiblePlatformCounters(place.platformCounters);

  return (
    <div role="group" aria-label="Категория и материалы" className="flex min-h-7 flex-wrap gap-1.5">
      {platformCounters.map(({ platform, count }) => {
        const platformDisplay = getPlatformDisplay(platform);

        return (
          <Badge
            render={<Link href={buildPlaceMaterialsHref(place.id, platform)} />}
            key={platform}
            className="h-6 gap-1 rounded-full border-transparent py-0 pr-2 pl-1 text-[0.8125rem] leading-6 font-bold no-underline transition-[filter,box-shadow] hover:brightness-95"
            style={{
              backgroundColor: platformDisplay.backgroundColor,
              color: platformDisplay.color,
            }}
          >
            <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-white/72 text-[0.72rem] leading-none font-extrabold">
              {count}
            </span>
            <span>{platformDisplay.label}</span>
          </Badge>
        );
      })}
    </div>
  );
}
