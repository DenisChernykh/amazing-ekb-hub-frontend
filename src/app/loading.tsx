import { PlaceFeedSkeleton } from '@/features/place-feed';
import { Card, Skeleton } from 'antd';
import type { CSSProperties } from 'react';

const pageStyle: CSSProperties = {
  padding: '40px 24px',
  display: 'grid',
  gap: '24px',
};

const introCardStyle: CSSProperties = {
  maxWidth: '960px',
  borderRadius: '24px',
};

/**
 * Route-level loading для главного дерева приложения.
 *
 * @returns Skeleton intro-блока и списка мест.
 */
export default function Loading() {
  return (
    <main style={pageStyle}>
      <Card style={introCardStyle}>
        <Skeleton active title={{ width: '42%' }} paragraph={{ rows: 2 }} />
      </Card>

      <PlaceFeedSkeleton />
    </main>
  );
}
