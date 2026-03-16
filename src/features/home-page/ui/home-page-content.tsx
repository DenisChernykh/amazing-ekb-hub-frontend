import type { PlaceListResult } from '@/entities/place';
import { buildPlaceFeedViewModel, PlaceFeed } from '@/features/place-feed';
import { Card } from 'antd';
import type { CSSProperties } from 'react';

/**
 * Параметры page-level presentation для главной страницы.
 */
export interface HomePageContentProps {
  result: PlaceListResult;
}
const pageStyle: CSSProperties = {
  padding: '40px 24px',
  display: 'grid',
  gap: '24px',
};

const introCardStyle: CSSProperties = {
  maxWidth: '960px',
  borderRadius: '24px',
};

const contentStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  color: 'rgba(0, 0, 0, 0.45)',
  fontSize: '14px',
  fontWeight: 600,
  letterSpacing: '0.08em',
  lineHeight: 1.4,
  textTransform: 'uppercase',
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
  lineHeight: 1.1,
};

const metaStyle: CSSProperties = {
  margin: 0,
  color: 'rgba(0, 0, 0, 0.65)',
  fontSize: '18px',
  lineHeight: 1.6,
};
/**
 * Рендерит page-level композицию главной страницы со вступительным блоком и лентой мест.
 *
 * @param result - Result-first ответ загрузки списка мест для home-экрана.
 * @returns Серверный presentation-компонент главной страницы.
 */
export function HomePageContent({ result }: Readonly<HomePageContentProps>) {
  const placeFeedViewModel = buildPlaceFeedViewModel(result);
  return (
    <main style={pageStyle}>
      <Card style={introCardStyle}>
        <section style={contentStyle}>
          <p style={eyebrowStyle}>Amazing EKB Hub</p>
          <h1 style={titleStyle}>Подборка мест в Екатеринбурге</h1>
          <p style={metaStyle}>
            Главная остается экраном выбора места: данные уже грузятся с backend, а карточный
            presentation вынесен в отдельный feature-слой.
          </p>
        </section>
      </Card>

      <PlaceFeed viewModel={placeFeedViewModel} />
    </main>
  );
}
