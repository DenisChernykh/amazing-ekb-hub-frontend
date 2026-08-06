import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CollectionPagination } from './collection-pagination';

describe('CollectionPagination', () => {
  it('omits the redundant page-one query and renders current/neighbor links', () => {
    const html = renderToStaticMarkup(
      createElement(CollectionPagination, {
        collectionSlug: 'weekend-spots',
        page: 1,
        pageSize: 20,
        total: 45,
      }),
    );

    expect(html).toContain('href="/collections/weekend-spots"');
    expect(html).not.toContain('page=1');
    expect(html).toContain('href="/collections/weekend-spots?page=2"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('Следующая');
  });

  it('renders previous/next and bounded ellipses on a middle page', () => {
    const html = renderToStaticMarkup(
      createElement(CollectionPagination, {
        collectionSlug: 'weekend-spots',
        page: 5,
        pageSize: 20,
        total: 200,
      }),
    );

    expect(html).toContain('href="/collections/weekend-spots?page=4"');
    expect(html).toContain('href="/collections/weekend-spots?page=6"');
    expect(html).toContain('Предыдущая');
    expect(html).toContain('Следующая');
    expect(html.match(/data-slot="pagination-ellipsis"/g)).toHaveLength(2);
    expect(html).not.toContain('page=0');
  });

  it('does not render pagination for an empty or single-page result', () => {
    expect(
      renderToStaticMarkup(
        createElement(CollectionPagination, {
          collectionSlug: 'empty',
          page: 1,
          pageSize: 20,
          total: 0,
        }),
      ),
    ).toBe('');
    expect(
      renderToStaticMarkup(
        createElement(CollectionPagination, {
          collectionSlug: 'single',
          page: 1,
          pageSize: 20,
          total: 20,
        }),
      ),
    ).toBe('');
  });
});
