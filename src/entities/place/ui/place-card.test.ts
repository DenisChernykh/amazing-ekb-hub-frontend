import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PlaceCardModel } from '../model/types';
import { PlaceCard } from './place-card';

const PLACE: PlaceCardModel = {
  id: 'place ekb/001',
  title: 'Баден-Баден Уктус',
  category: {
    id: 'category_spa',
    slug: 'spa',
    title: 'SPA',
    badgeBackgroundColor: '#faf0ed',
  },
  coverImageUrl: '/images/places/baden.webp',
  platformCounters: {
    dzen: 12,
    telegram: 7,
    instagram: 0,
  },
};

describe('PlaceCard', () => {
  it('transitions the Tailwind individual translate property for card lift', () => {
    const html = renderToStaticMarkup(createElement(PlaceCard, { place: PLACE }));

    expect(html).toContain('motion-safe:transition-[transform,translate,box-shadow]');
  });

  it('keeps the stronger focus shadow when hover and focus-within are active together', () => {
    const html = renderToStaticMarkup(createElement(PlaceCard, { place: PLACE }));

    expect(html).toContain('hover:focus-within:shadow-app-card-focus');
  });

  it('server-renders the complete card with separate semantic links and no MUI markup', () => {
    const html = renderToStaticMarkup(createElement(PlaceCard, { place: PLACE }));
    const anchorFragments = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) ?? [];

    expect(html).toContain('data-slot="card"');
    expect(html).toContain('data-slot="card-content"');
    expect(html.match(/href="\/places\/place%20ekb%2F001"/g)).toHaveLength(2);
    expect(html).toContain('href="/places/place%20ekb%2F001#materials-dzen"');
    expect(html).toContain('href="/places/place%20ekb%2F001#materials-telegram"');
    expect(html).toContain('Баден-Баден Уктус');
    expect(html).toContain('alt="Фото места Баден-Баден Уктус"');
    expect(html).toContain('/images/places/baden.webp');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('>SPA<');
    expect(html.match(/data-slot="badge"/g)).toHaveLength(3);
    expect(anchorFragments).toHaveLength(4);
    expect(anchorFragments.every((anchor) => (anchor.match(/<a\b/g) ?? []).length === 1)).toBe(
      true,
    );
    expect(html).not.toContain('Mui');
  });

  it('uses the deterministic local image when the cover URL is blank', () => {
    const html = renderToStaticMarkup(
      createElement(PlaceCard, {
        place: {
          ...PLACE,
          coverImageUrl: '   ',
        },
      }),
    );

    expect(html).toContain('/images/places/place-placeholder.webp');
    expect(html).toContain('alt="Фото места Баден-Баден Уктус"');
  });
});
