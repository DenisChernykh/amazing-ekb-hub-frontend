import { cn } from '@/shared/lib/utils';
import Image from 'next/image';
import type { PlaceCardVariant } from '../model/types';

const PLACE_PLACEHOLDER_IMAGE_SRC = '/images/places/place-placeholder.webp';

/** Отображает обложку места или стандартный placeholder. */
export function PlaceCardImage({
  src,
  variant,
  loading,
}: Readonly<{
  src: string | null;
  variant: PlaceCardVariant;
  loading: 'eager' | 'lazy';
}>) {
  return (
    <div
      className={cn(
        'bg-muted',
        variant === 'tall' ? 'place-card-media-tall' : 'place-card-media-regular',
      )}
    >
      <Image
        fill
        unoptimized
        src={src ?? PLACE_PLACEHOLDER_IMAGE_SRC}
        alt=""
        loading={loading}
        sizes="(min-width: 1024px) 33vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}
