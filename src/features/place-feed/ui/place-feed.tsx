import type { PlaceCategory, PlaceListResult } from '@/entities/place';
import {
  buildPlaceFeedViewModel,
  type PlaceCardViewModel,
} from '@/features/place-feed/model/place-feed.view-model';
import { Alert, Card, Empty, Tag } from 'antd';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import styles from './place-feed.module.css';
/**
 * Параметры presentation-компонента ленты мест.
 */
export interface PlaceFeedProps {
  result: PlaceListResult;
}

const sectionCardStyle: CSSProperties = {
  maxWidth: '960px',
  borderRadius: '24px',
};

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
 * Презентационная карточка одного места в home-ленте.
 *
 * @param place - View model карточки места.
 * @returns Карточку места с CTA перехода на detail route.
 */
function PlaceCard({ place }: Readonly<{ place: PlaceCardViewModel }>) {
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

/**
 * Рендерит состояния home-ленты мест: success, empty, error.
 *
 * @param result - Result-first ответ загрузки списка мест.
 * @returns Presentation-компонент ленты мест.
 */
export function PlaceFeed({ result }: Readonly<PlaceFeedProps>) {
  const viewModel = buildPlaceFeedViewModel(result);

  switch (viewModel.kind) {
    case 'error':
      return (
        <Card style={sectionCardStyle}>
          <Alert
            showIcon
            type="error"
            title={viewModel.title}
            description={viewModel.description}
          />
        </Card>
      );

    case 'empty':
      return (
        <Card style={sectionCardStyle}>
          <Empty description={viewModel.description} />
        </Card>
      );

    case 'success':
      return (
        <Card style={sectionCardStyle} title={viewModel.title} extra={viewModel.meta}>
          <section className={styles.grid}>
            {viewModel.items.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </section>
        </Card>
      );
  }
}
