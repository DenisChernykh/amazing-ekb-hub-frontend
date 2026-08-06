import type { CollectionCardModel } from '@/entities/collection';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CollectionGrid } from './collection-grid';

const COLLECTIONS: CollectionCardModel[] = Array.from({ length: 6 }, (_, index) => ({
  id: `collection-${index + 1}`,
  slug: `collection-${index + 1}`,
  title: `Подборка ${index + 1}`,
  description: null,
  coverImageUrl: index < 4 || index === 5 ? `/v1/collections/collection-${index + 1}/photo` : null,
  placeCount: index + 1,
}));

describe('CollectionGrid', () => {
  it('renders collections in API order with responsive grid and eager first row', () => {
    const html = renderToStaticMarkup(
      createElement(CollectionGrid, {
        collections: COLLECTIONS,
        ariaLabel: 'Подборки мест',
      }),
    );

    expect(html).toContain('grid-cols-1');
    expect(html).toContain('sm:grid-cols-2');
    expect(html).toContain('lg:grid-cols-4');
    expect(html).toContain('aria-label="Подборки мест"');
    expect(html.indexOf('Подборка 1')).toBeLessThan(html.indexOf('Подборка 2'));
    expect(html.match(/href="\/collections\//g)).toHaveLength(COLLECTIONS.length);
    expect(html.match(/loading="eager"/g)).toHaveLength(4);
    expect(html.match(/loading="lazy"/g)).toHaveLength(1);
  });

  it('renders a deterministic empty state without collection links', () => {
    const html = renderToStaticMarkup(
      createElement(CollectionGrid, { collections: [], ariaLabel: 'Подборки мест' }),
    );

    expect(html).toContain('Подборок пока нет.');
    expect(html).not.toContain('/collections/');
  });
});
