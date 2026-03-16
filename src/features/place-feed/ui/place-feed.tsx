import type { PlaceFeedViewModel } from '@/features/place-feed/model/place-feed.view-model.types';
import { Alert, Card, Empty } from 'antd';
import type { CSSProperties } from 'react';

import { PlaceCard } from './place-card';
import styles from './place-feed.module.css';

/**
 * Параметры presentation-компонента ленты мест.
 */
export interface PlaceFeedProps {
  viewModel: PlaceFeedViewModel;
}

const sectionCardStyle: CSSProperties = {
  maxWidth: '960px',
  borderRadius: '24px',
};

/**
 * Рендерит состояния home-ленты мест: success, empty, error.
 *
 * @param viewModel - Готовая presentation-модель ленты мест.
 * @returns Presentation-компонент ленты мест.
 */
export function PlaceFeed({ viewModel }: Readonly<PlaceFeedProps>) {
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
