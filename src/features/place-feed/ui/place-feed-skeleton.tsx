import type { PlaceCategory } from '@/entities/place';
import { Card, Skeleton } from 'antd';
import type { CSSProperties } from 'react';

import styles from './place-feed.module.css';
/**
 * Параметры skeleton-ленты мест.
 */
export interface PlaceFeedSkeletonProps {
  count?: number;
}

const sectionCardStyle: CSSProperties = {
  maxWidth: '960px',
  borderRadius: '24px',
};

const SKELETON_CATEGORIES: readonly PlaceCategory[] = [
  'spa',
  'pools',
  'cafe',
  'hotels',
  'workshops',
];

/**
 * Презентационный skeleton одной карточки места.
 *
 * @param category - Категория, используемая только для tonal media fallback.
 * @returns Skeleton карточки места.
 */
function PlaceCardSkeleton({ category }: Readonly<{ category: PlaceCategory }>) {
  return (
    <article className={styles.placeCard}>
      <div className={styles.placeMedia} data-category={category}>
        <span className={styles.mediaEyebrow}>Загрузка</span>
      </div>

      <div className={styles.skeletonBody}>
        <Skeleton active paragraph={{ rows: 3 }} title={{ width: '68%' }} />
      </div>
    </article>
  );
}

/**
 * Route-level skeleton home-ленты мест.
 *
 * @param count - Количество placeholder карточек.
 * @returns Skeleton списка мест.
 */
export function PlaceFeedSkeleton({ count = 5 }: Readonly<PlaceFeedSkeletonProps>) {
  const items = Array.from({ length: count }, (_, index) => ({
    id: `skeleton-${index}`,
    category: SKELETON_CATEGORIES[index % SKELETON_CATEGORIES.length],
  }));

  return (
    <Card style={sectionCardStyle} title="Загружаем места...">
      <section className={styles.grid}>
        {items.map((item) => (
          <PlaceCardSkeleton key={item.id} category={item.category} />
        ))}
      </section>
    </Card>
  );
}
