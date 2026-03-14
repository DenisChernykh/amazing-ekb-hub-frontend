import { Button, Card } from 'antd';
import type { CSSProperties } from 'react';

const pageStyle: CSSProperties = {
  padding: '40px 24px',
};

const cardStyle: CSSProperties = {
  maxWidth: '760px',
  borderRadius: '24px',
};

const contentStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
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

export default function HomePage() {
  return (
    <main style={pageStyle}>
      <Card style={cardStyle}>
        <section style={contentStyle}>
          <p style={eyebrowStyle}>Стрельчук в Екатеринбурге</p>
          <h1 style={titleStyle}>Добро пожаловать в мой гид по Екатеринбургу</h1>
          <p style={metaStyle}>Автор: Стрельчук Татьяна</p>

          <div>
            <Button type="primary" size="large">
              Начать путешествие
            </Button>
          </div>
        </section>
      </Card>
    </main>
  );
}
