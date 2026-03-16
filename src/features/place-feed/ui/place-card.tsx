import type { PlaceCategory } from '@/entities/place';
import type { PlaceCardViewModel } from '@/features/place-feed/model/place-feed.view-model.types';
import { Tag } from 'antd';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import styles from './place-feed.module.css';

/**
 * Параметры презентационной карточки места.
 */
export interface PlaceCardProps {
  place: PlaceCardViewModel;
}

const CATEGORY_TAG_STYLES: Record<PlaceCategory, CSSProperties> = {
  pools: {
    backgroundColor: '#eff4f8',
    color: '#36536b',
    borderColor: 'transparent',
  },
  spa: {
    backgroundColor: '#faf0ed',
    color: '#7c4b3b',
    borderColor: 'transparent',
  },
  cafe: {
    backgroundColor: '#fff4e8',
    color: '#8a5528',
    borderColor: 'transparent',
  },
  hotels: {
    backgroundColor: '#f4f3f1',
    color: '#5f5b54',
    borderColor: 'transparent',
  },
  workshops: {
    backgroundColor: '#f5efe7',
    color: '#735636',
    borderColor: 'transparent',
  },
};

/**
 * Рендерит одну карточку места в home-ленте.
 *
 * @param place - Готовая view model карточки.
 * @returns Презентационную карточку с тегами и ссылкой на detail route.
 */
export function PlaceCard({ place }: Readonly<PlaceCardProps>) {
  return (
    <article className={styles.placeCard}>
      <div className={styles.placeMedia} data-category={place.category}>
        <span className={styles.mediaEyebrow}>Amazing EKB</span>

        <div className={styles.mediaFooter}>
          <span className={styles.mediaCategory}>{place.categoryLabel}</span>

          {place.tags.length > 0 ? (
            <p className={styles.mediaHint}>{place.tags.slice(0, 2).join(' · ')}</p>
          ) : null}
        </div>
      </div>

      <div className={styles.placeBody}>
        <h3 className={styles.placeTitle}>{place.title}</h3>

        <p className={styles.placeSummary}>{place.summary}</p>

        {place.tags.length > 0 ? (
          <div className={styles.tagRow}>
            {place.tags.map((tag) => (
              <Tag key={tag} style={CATEGORY_TAG_STYLES[place.category]}>
                {tag}
              </Tag>
            ))}
          </div>
        ) : null}

        <div className={styles.actionsRow}>
          <Link href={place.href} className={styles.actionLink}>
            Открыть место
          </Link>
        </div>
      </div>
    </article>
  );
}
