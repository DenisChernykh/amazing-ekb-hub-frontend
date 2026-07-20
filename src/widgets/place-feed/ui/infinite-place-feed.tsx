'use client';

import type { CategoryPlacesPage } from '@/entities/place';
import { PlacesAppendControl, useInfinitePlaces } from '@/features/infinite-places';
import { PlaceFeed } from './place-feed';

/** Композирует SSR-ленту мест с клиентским append-контролом. */
export function InfinitePlaceFeed({
  initialPage,
  categorySlug,
}: Readonly<{ initialPage: CategoryPlacesPage; categorySlug: string }>) {
  const { items, status, sentinelRef, retry } = useInfinitePlaces({
    initialPage,
    categorySlug,
  });

  return (
    <>
      <PlaceFeed items={items} />
      <PlacesAppendControl status={status} sentinelRef={sentinelRef} onRetry={retry} />
    </>
  );
}
