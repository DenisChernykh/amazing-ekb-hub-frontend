import type { CollectionCardModel } from '@/entities/collection';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CollectionPageContent } from './collection-page-content';

const COLLECTION = {
  id: 'collection-1',
  slug: 'weekend-spots',
  title: 'Места для выходных',
  description: 'Описание подборки',
  coverImageUrl: '/v1/collections/weekend-spots/photo',
} satisfies Pick<CollectionCardModel, 'id' | 'slug' | 'title' | 'description' | 'coverImageUrl'>;

const PLACES = Array.from({ length: 5 }, (_, index) => ({
  id: `place-${index + 1}`,
  slug: `place-${index + 1}`,
  title: `Место ${index + 1}`,
  coverImageUrl: null,
}));

describe('CollectionPageContent', () => {
  it('renders breadcrumbs, optional header fields, PlaceFeed and pagination', () => {
    const html = renderToStaticMarkup(
      createElement(CollectionPageContent, {
        collection: COLLECTION,
        places: PLACES,
        page: 2,
        pageSize: 20,
        total: 45,
      }),
    );

    expect(html).toContain('aria-label="Хлебные крошки"');
    expect(html).toContain('href="/collections"');
    expect(html).toContain('>Места для выходных</h1>');
    expect(html).toContain('Описание подборки');
    expect(html).toContain('/v1/collections/weekend-spots/photo');
    expect(html).toContain('aria-label="Места"');
    expect(html.match(/href="\/places\/place-[1-5]"/g)).toHaveLength(5);
    expect(html).toContain('href="/collections/weekend-spots"');
    expect(html).toContain('href="/collections/weekend-spots?page=3"');
    expect(html).toContain('aria-current="page"');
  });

  it('omits the hero image and PlaceFeed when optional data is absent', () => {
    const html = renderToStaticMarkup(
      createElement(CollectionPageContent, {
        collection: { ...COLLECTION, description: null, coverImageUrl: null },
        places: [],
        page: 1,
        pageSize: 20,
        total: 0,
      }),
    );

    expect(html).toContain('В этой подборке пока нет мест.');
    expect(html).not.toContain('collections/weekend-spots/photo');
    expect(html).not.toContain('aria-label="Места"');
  });
});
