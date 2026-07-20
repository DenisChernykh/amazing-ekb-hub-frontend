import type { CategoryPlacesPage } from '@/entities/place';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { InfinitePlaces, PlacesAppendControl } from './infinite-places';

function createPage(total: number): CategoryPlacesPage {
  return {
    items: Array.from({ length: 20 }, (_, index) => ({
      id: String(index + 1),
      slug: `place-${index + 1}`,
      title: `Место ${index + 1}`,
      coverImageUrl: null,
    })),
    page: 1,
    pageSize: 20,
    total,
  };
}

describe('InfinitePlaces', () => {
  it('renders the server-provided first page and an idle sentinel without refetching page one', () => {
    const html = renderToStaticMarkup(
      createElement(InfinitePlaces, {
        initialPage: createPage(21),
        categorySlug: 'spa',
      }),
    );

    expect(html.match(/href="\/places\/place-(?:[1-9]|1\d|20)"/g)).toHaveLength(20);
    expect(html).toContain('data-category-places-sentinel="true"');
    expect(html).not.toContain('role="status"');
    expect(html).not.toContain('Повторить');
  });

  it('renders no append control when the initial page is already complete', () => {
    const html = renderToStaticMarkup(
      createElement(InfinitePlaces, {
        initialPage: createPage(20),
        categorySlug: 'spa',
      }),
    );

    expect(html).not.toContain('places-append-control');
    expect(html).not.toContain('data-category-places-sentinel');
  });
});

describe('PlacesAppendControl', () => {
  it('renders a textless visual loader with an accessible live status', () => {
    const html = renderToStaticMarkup(
      createElement(PlacesAppendControl, {
        status: 'loading',
        sentinelRef: { current: null },
        onRetry: vi.fn(),
      }),
    );

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('class="sr-only">Загружаем следующие места</span>');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('places-append-loader-track');
    expect(html).toContain('places-append-loader-segment');
  });

  it('renders an explicit retry button while preserving the append control height', () => {
    const html = renderToStaticMarkup(
      createElement(PlacesAppendControl, {
        status: 'error',
        sentinelRef: { current: null },
        onRetry: vi.fn(),
      }),
    );

    expect(html).toContain('places-append-control');
    expect(html).toContain('<button');
    expect(html).toContain('>Повторить</button>');
  });
});
