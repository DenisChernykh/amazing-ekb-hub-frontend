import type { PlaceCardModel } from '@/entities/place';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PlaceFeed } from './place-feed';

const ITEMS: PlaceCardModel[] = Array.from({ length: 5 }, (_, index) => ({
  id: String(index + 1),
  slug: `place-${index + 1}`,
  title: `Place ${index + 1}`,
  coverImageUrl: null,
}));
const FORBIDDEN_GRID_FLOW = ['grid', 'auto', 'flow'].join('-');
const FORBIDDEN_DENSE = ['den', 'se'].join('');

describe('PlaceFeed', () => {
  it('renders each five-card module with one tall card and four regular cards', () => {
    const html = renderToStaticMarkup(createElement(PlaceFeed, { items: ITEMS }));

    expect(html).toContain('place-feed-module');
    expect(html.match(/place-feed-module-tall/g)).toHaveLength(1);
    expect(html.match(/place-card-media-tall/g)).toHaveLength(1);
    expect(html.match(/place-card-media-regular/g)).toHaveLength(4);
    expect(html).not.toContain(FORBIDDEN_GRID_FLOW);
    expect(html).not.toContain(FORBIDDEN_DENSE);
  });

  it('eagerly loads the first visual module and keeps following images lazy', () => {
    const html = renderToStaticMarkup(
      createElement(PlaceFeed, {
        items: [...ITEMS, { id: '6', slug: 'place-6', title: 'Place 6', coverImageUrl: null }],
      }),
    );

    expect(html.match(/loading="eager"/g)).toHaveLength(5);
    expect(html.match(/loading="lazy"/g)).toHaveLength(1);
  });
});
