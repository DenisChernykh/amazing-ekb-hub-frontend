import type { CategoryPlacesPage } from '@/entities/place';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { InfinitePlaceFeed } from './infinite-place-feed';

/** Creates a serializable first page for server-markup checks. */
function createPage(total: number): CategoryPlacesPage {
  return {
    items: Array.from({ length: 3 }, (_, index) => {
      const id = String(index + 1);

      return {
        id,
        slug: `place-${id}`,
        title: `Место ${id}`,
        coverImageUrl: null,
      };
    }),
    page: 1,
    pageSize: 20,
    total,
  };
}

describe('InfinitePlaceFeed server markup', () => {
  it('renders the server-provided items and an idle append sentinel', () => {
    const html = renderToStaticMarkup(
      createElement(InfinitePlaceFeed, {
        initialPage: createPage(23),
        categorySlug: 'spa',
      }),
    );

    expect(html.match(/<article/g)).toHaveLength(3);
    expect(html).toContain('href="/places/place-1"');
    expect(html).toContain('data-category-places-sentinel="true"');
    expect(html).not.toContain('role="status"');
    expect(html).not.toContain('>Повторить</button>');
  });

  it('omits the append control when the server-provided page is complete', () => {
    const html = renderToStaticMarkup(
      createElement(InfinitePlaceFeed, {
        initialPage: createPage(3),
        categorySlug: 'spa',
      }),
    );

    expect(html.match(/<article/g)).toHaveLength(3);
    expect(html).not.toContain('places-append-control');
    expect(html).not.toContain('data-category-places-sentinel="true"');
  });
});
