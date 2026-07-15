import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { PlacesPagination } from './places-pagination';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

/**
 * Это хелпер. Рендерит пагинацию в статическую HTML-разметку.
 *
 * @param page - Текущая страница.
 * @param pageCount - Общее число страниц.
 * @returns Статическая HTML-разметка пагинации.
 */
function renderPagination(page: number, pageCount: number): string {
  return renderToStaticMarkup(
    createElement(PlacesPagination, {
      pagination: { page, pageCount },
      currentSearchParams: `search=spa&page=${page}`,
    }),
  );
}

describe('PlacesPagination', () => {
  it('renders nothing for a single page', () => {
    expect(renderPagination(1, 1)).toBe('');
  });

  it('renders accessible disabled boundaries and the compact start range', () => {
    const html = renderPagination(1, 20);

    expect(html).toContain('aria-label="Пагинация мест"');
    expect(html.match(/aria-disabled="true"/g)).toHaveLength(2);
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('aria-label="Страница 1, текущая"');
    expect(html).toContain('aria-label="Следующая страница"');
    expect(html).toContain('href="/?search=spa&amp;page=2"');
    expect(html).toContain('aria-label="Последняя страница"');
    expect(html).toContain('href="/?search=spa&amp;page=20"');
    expect(html).toContain('data-slot="pagination-ellipsis"');
    expect(html).toContain('hidden min-[600px]:block');
    expect(html).not.toContain('Mui');
  });

  it('renders two ellipses and neighboring destinations in the middle', () => {
    const html = renderPagination(10, 20);

    expect(html.match(/data-slot="pagination-ellipsis"/g)).toHaveLength(2);
    expect(html).toContain('aria-label="Страница 10, текущая"');
    expect(html).toContain('href="/?search=spa&amp;page=9"');
    expect(html).toContain('href="/?search=spa&amp;page=11"');
    expect(html).toContain('href="/?search=spa"');
    expect(html).toContain('href="/?search=spa&amp;page=20"');
  });

  it('disables next and last controls on the final page', () => {
    const html = renderPagination(20, 20);

    expect(html.match(/aria-disabled="true"/g)).toHaveLength(2);
    expect(html).toContain('aria-label="Страница 20, текущая"');
    expect(html).toContain('aria-label="Предыдущая страница"');
    expect(html).toContain('href="/?search=spa&amp;page=19"');
  });
});
