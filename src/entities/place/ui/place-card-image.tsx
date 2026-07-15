import Image from 'next/image';
import type { PlaceCardModel } from '../model/types';
import { PlaceCategoryBadge } from './place-category-badge';

const PLACE_PLACEHOLDER_IMAGE_SRC = '/images/places/place-placeholder.webp';

interface PlaceCardImageProps {
  category: PlaceCardModel['category'];
  src: string | null;
  title: string;
}

/**
 * Рендерит фото карточки места с локальной заглушкой.
 *
 * @param props - Данные изображения карточки.
 */
export function PlaceCardImage({ category, src, title }: Readonly<PlaceCardImageProps>) {
  const imageSrc = src?.trim() ? src : PLACE_PLACEHOLDER_IMAGE_SRC;

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
      <Image
        fill
        unoptimized
        src={imageSrc}
        alt={`Фото места ${title}`}
        loading="lazy"
        sizes="(max-width: 899px) calc(100vw - 32px), (max-width: 1199px) calc((100vw - 64px) / 2), 384px"
        className="object-cover motion-safe:transition-transform motion-safe:duration-[260ms] motion-safe:ease-out motion-safe:group-hover/card:scale-[1.035] motion-safe:group-focus-within/card:scale-[1.035]"
      />

      <PlaceCategoryBadge
        category={category}
        className="absolute top-3 left-3 z-[1] shadow-[0_8px_20px_rgb(15_23_42/14%)]"
      />
    </div>
  );
}
