import { Button, Card } from 'antd';
import type { CSSProperties } from 'react';

interface PlaceDetailPageProps {
  params: Promise<{ placeId: string }>;
}

const pageStyle: CSSProperties = {
  padding: '40px 24px',
  display: 'grid',
  gap: '24px',
};

const cardStyle: CSSProperties = {
  maxWidth: '960px',
  borderRadius: '24px',
};

const stackStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
  lineHeight: 1.1,
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1.25rem',
  lineHeight: 1.2,
};

const paragraphStyle: CSSProperties = {
  margin: 0,
  color: 'rgba(0, 0, 0, 0.68)',
  lineHeight: 1.6,
};

const codeStyle: CSSProperties = {
  display: 'inline-block',
  width: 'fit-content',
  padding: '8px 12px',
  borderRadius: '999px',
  background: '#f4f3f1',
  color: '#18181b',
  fontFamily: 'monospace',
  fontSize: '14px',
};

/**
 * Временная detail-route заглушка для сценария перехода из home-карточки.
 *
 * @param params - Dynamic route params Next App Router.
 * @returns Экран-заглушку для будущей страницы места.
 */
export default async function PlaceDetailPage({ params }: Readonly<PlaceDetailPageProps>) {
  const { placeId } = await params;

  return (
    <main style={pageStyle}>
      <Card style={cardStyle}>
        <section style={stackStyle}>
          <h1 style={titleStyle}>Страница места будет следующим шагом</h1>

          <p style={paragraphStyle}>
            Маршрут уже подключен, поэтому карточка ведет на реальную страницу, а не в пустую
            заглушку браузера.
          </p>

          <div>
            <Button href="/" type="primary">
              Вернуться к списку мест
            </Button>
          </div>
        </section>
      </Card>

      <Card style={cardStyle}>
        <section style={stackStyle}>
          <h2 style={sectionTitleStyle}>Текущий route param</h2>

          <code style={codeStyle}>{placeId}</code>

          <p style={paragraphStyle}>
            Пока здесь только route-level заглушка. На следующей итерации сюда можно будет поднимать
            загрузку detail-данных места и материалов.
          </p>
        </section>
      </Card>
    </main>
  );
}
