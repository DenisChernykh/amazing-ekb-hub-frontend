import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PlaceCardModel } from '../model/types';
import { PlaceCard } from './place-card';

const PLACE: PlaceCardModel & {
  category: { id: string; slug: string; title: string };
  platformCounters: { dzen: number; telegram: number; instagram: number };
  summary: string;
} = {
  id: 'place_ekb_001',
  slug: 'baden-baden-uktus',
  title: 'Баден-Баден Уктус',
  coverImageUrl: '/images/places/baden.webp',
  category: {
    id: 'category_spa',
    slug: 'spa',
    title: 'SPA',
  },
  platformCounters: {
    dzen: 12,
    telegram: 7,
    instagram: 0,
  },
  summary: 'Thermal complex with spa zone.',
};

describe('PlaceCard', () => {
  it('renders one minimal link with a decorative image and title', () => {
    const html = renderToStaticMarkup(createElement(PlaceCard, { place: PLACE, variant: 'tall' }));
    const anchorFragments = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) ?? [];

    expect(html.match(/href="\/places\/baden-baden-uktus"/g)).toHaveLength(1);
    expect(anchorFragments).toHaveLength(1);
    expect(html).toContain('Баден-Баден Уктус');
    expect(html).toContain('alt=""');
    expect(html).toContain('/images/places/baden.webp');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('place-card-media-tall');
    expect(html).not.toContain('SPA');
    expect(html).not.toContain('Telegram');
    expect(html).not.toContain('Дзен');
    expect(html).not.toContain('Instagram');
    expect(html).not.toContain('>12<');
    expect(html).not.toContain('>7<');
    expect(html).not.toContain('Thermal complex with spa zone.');
    expect(html).not.toContain('badge');
    expect(html).not.toContain('rounded');
    expect(html).not.toContain('shadow');
  });

  it('renders an absolute cover URL without the Next.js image optimizer', () => {
    const coverImageUrl = 'https://api.example.com/v1/places/place_ekb_001/photo';
    const html = renderToStaticMarkup(
      createElement(PlaceCard, {
        place: {
          ...PLACE,
          coverImageUrl,
        },
        variant: 'regular',
      }),
    );

    expect(html).toContain(`src="${coverImageUrl}"`);
    expect(html).not.toContain('/_next/image');
  });
});
