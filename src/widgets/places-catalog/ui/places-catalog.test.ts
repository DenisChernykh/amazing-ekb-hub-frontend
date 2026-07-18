import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { PlacesCatalogModel } from '../model/types';
import { PlacesCatalog } from './places-catalog';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const MODEL: PlacesCatalogModel = {
  results: {
    total: 1,
    items: [
      {
        id: 'place_ekb_001',
        slug: 'baden-baden-uktus',
        title: 'Баден-Баден Уктус',
        category: {
          id: 'category_spa',
          slug: 'spa',
          title: 'SPA',
        },
        coverImageUrl: null,
        platformCounters: {
          dzen: 12,
          telegram: 7,
          instagram: 0,
        },
      },
    ],
  },
  controls: {
    categories: [
      {
        id: 'category_spa',
        slug: 'spa',
        title: 'SPA',
      },
    ],
  },
  pagination: {
    page: 1,
    pageCount: 3,
  },
  links: {
    resetFilters: '/',
    firstPage: '/',
  },
  navigation: {
    currentSearchParams: '',
  },
};

describe('PlacesCatalog', () => {
  it('server-renders the populated catalog with semantic responsive grid and no MUI', () => {
    const html = renderToStaticMarkup(createElement(PlacesCatalog, { model: MODEL }));

    expect(html).toContain('<main');
    expect(html).toContain('data-slot="container"');
    expect(html).toContain('pt-[30px]');
    expect(html).toContain('pb-16');
    expect(html).not.toContain('max-w-[1200px]');
    expect(html).toContain('<h1');
    expect(html).toContain('>Места</h1>');
    expect(html).toContain('Найдено: 1');
    expect(html).toContain('Страница 1 из 3');
    expect(html).toContain('aria-label="Список мест"');
    expect(html).toContain('min-[900px]:grid-cols-2');
    expect(html).toContain('min-[1200px]:grid-cols-3');
    expect(html).toContain('Баден-Баден Уктус');
    expect(html).toContain('aria-label="Пагинация мест"');
    expect(html).not.toContain('Mui');
  });

  it('renders the filtered empty state without a card grid', () => {
    const html = renderToStaticMarkup(
      createElement(PlacesCatalog, {
        model: {
          ...MODEL,
          results: { items: [], total: 0 },
          controls: { ...MODEL.controls, search: 'missing' },
          pagination: { page: 1, pageCount: 0 },
          links: { ...MODEL.links, resetFilters: '/?pageSize=40' },
          navigation: { currentSearchParams: 'search=missing' },
        },
      }),
    );

    expect(html).toContain('Ничего не найдено');
    expect(html).toContain('href="/?pageSize=40"');
    expect(html).not.toContain('aria-label="Список мест"');
  });

  it('renders the out-of-range page state with a first-page action', () => {
    const html = renderToStaticMarkup(
      createElement(PlacesCatalog, {
        model: {
          ...MODEL,
          results: { items: [], total: 1 },
          pagination: { page: 2, pageCount: 3 },
          links: { ...MODEL.links, firstPage: '/?search=spa' },
          navigation: { currentSearchParams: 'search=spa&page=2' },
        },
      }),
    );

    expect(html).toContain('На этой странице нет мест');
    expect(html).toContain('href="/?search=spa"');
    expect(html).toContain('Перейти на первую страницу');
  });
});
