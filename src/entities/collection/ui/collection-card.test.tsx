import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { CollectionCardModel } from '../model/types';
import { CollectionCard } from './collection-card';

const COLLECTION: CollectionCardModel = {
  id: 'collection-1',
  slug: 'weekend-spots',
  title: 'Места для выходных',
  description: 'Короткие поездки по Екатеринбургу.',
  coverImageUrl: '/v1/collections/weekend-spots/photo',
  placeCount: 3,
};

describe('CollectionCard', () => {
  it('renders one accessible link with cover, description and Russian count', () => {
    const html = renderToStaticMarkup(createElement(CollectionCard, { collection: COLLECTION }));

    expect(html.match(/href="\/collections\/weekend-spots"/g)).toHaveLength(1);
    expect(html).toContain('/v1/collections/weekend-spots/photo');
    expect(html).toContain('Короткие поездки по Екатеринбургу.');
    expect(html).toContain('3 места');
    expect(html).toContain('object-cover');
    expect(html).not.toContain('<button');
  });

  it.each([
    [1, '1 место'],
    [2, '2 места'],
    [4, '4 места'],
    [5, '5 мест'],
    [11, '11 мест'],
    [21, '21 место'],
  ])('declines %s places as %s', (placeCount, expected) => {
    const html = renderToStaticMarkup(
      createElement(CollectionCard, {
        collection: { ...COLLECTION, description: null, coverImageUrl: null, placeCount },
      }),
    );

    expect(html).toContain(expected);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('>М</div>');
    expect(html).not.toContain('undefined');
  });
});
