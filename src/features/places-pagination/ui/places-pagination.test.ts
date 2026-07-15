import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlacesPagination } from './places-pagination';
import { handlePlacesPaginationClick, PlacesPaginationAction } from './places-pagination-action';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

type PaginationClickEvent = Parameters<typeof handlePlacesPaginationClick>[0]['event'];

/**
 * Это хелпер. Создаёт минимальный mouse event для проверки link interception.
 *
 * @param overrides - Переопределения состояния клика.
 * @returns Event contract и spy метода preventDefault.
 */
function createClickEvent(overrides: Partial<PaginationClickEvent> = {}) {
  const preventDefault = vi.fn();

  return {
    event: {
      altKey: false,
      button: 0,
      ctrlKey: false,
      defaultPrevented: false,
      metaKey: false,
      preventDefault,
      shiftKey: false,
      ...overrides,
    },
    preventDefault,
  };
}

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

/**
 * Это хелпер. Находит anchor-разметку pagination action по доступному имени.
 *
 * @param html - Статическая HTML-разметка пагинации.
 * @param ariaLabel - Доступное имя action.
 * @returns Открывающий тег pagination action.
 */
function getPaginationActionMarkup(html: string, ariaLabel: string): string {
  const markup = html.match(new RegExp(`<a[^>]*aria-label="${ariaLabel}"[^>]*>`))?.[0];

  if (!markup) {
    throw new Error(`Pagination action not found: ${ariaLabel}`);
  }

  return markup;
}

describe('PlacesPaginationAction', () => {
  it('exposes a disabled action as an explicit link outside the tab order', () => {
    const action = PlacesPaginationAction({
      ariaLabel: 'Первая страница',
      children: '1',
      currentSearchParams: 'search=spa&page=2',
      disabled: true,
      onNavigate: vi.fn(),
      page: 1,
    });

    expect(action.props).toMatchObject({
      'aria-disabled': true,
      role: 'link',
      tabIndex: -1,
    });
    expect(action.props.href).toBeUndefined();
  });

  it('removes click interception and destination from a disabled action', () => {
    const action = PlacesPaginationAction({
      ariaLabel: 'Первая страница',
      children: '1',
      currentSearchParams: 'search=spa&page=2',
      disabled: true,
      onNavigate: vi.fn(),
      page: 1,
    });

    expect(action.props.href).toBeUndefined();
    expect(action.props.onClick).toBeUndefined();
  });

  it('keeps an enabled action as a native link with click interception', () => {
    const action = PlacesPaginationAction({
      ariaLabel: 'Следующая страница',
      children: '2',
      currentSearchParams: 'search=spa&page=1',
      onNavigate: vi.fn(),
      page: 2,
    });

    expect(action.props.href).toBe('/?search=spa&page=2');
    expect(action.props.role).toBeUndefined();
    expect(action.props.onClick).toEqual(expect.any(Function));
  });
});

describe('handlePlacesPaginationClick', () => {
  beforeEach(() => {
    push.mockReset();
  });

  it.each([
    ['already prevented', { defaultPrevented: true }],
    ['meta-modified', { metaKey: true }],
    ['control-modified', { ctrlKey: true }],
    ['shift-modified', { shiftKey: true }],
    ['alt-modified', { altKey: true }],
    ['non-primary', { button: 1 }],
  ])('leaves %s clicks to the browser', (_label, overrides) => {
    const { event, preventDefault } = createClickEvent(overrides);

    handlePlacesPaginationClick({
      currentPage: 2,
      currentSearchParams: 'search=spa&page=2',
      event,
      nextPage: 3,
      push,
    });

    expect(preventDefault).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it('intercepts an unmodified primary click and pushes one canonical href', () => {
    const { event, preventDefault } = createClickEvent();

    handlePlacesPaginationClick({
      currentPage: 2,
      currentSearchParams: 'search=spa&page=2',
      event,
      nextPage: 1,
      push,
    });

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledWith('/?search=spa');
  });

  it('prevents an unmodified primary click on the current page without pushing', () => {
    const { event, preventDefault } = createClickEvent();

    handlePlacesPaginationClick({
      currentPage: 2,
      currentSearchParams: 'search=spa&page=2',
      event,
      nextPage: 2,
      push,
    });

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(push).not.toHaveBeenCalled();
  });
});

describe('PlacesPagination', () => {
  it('renders nothing for a single page', () => {
    expect(renderPagination(1, 1)).toBe('');
  });

  it('renders accessible disabled boundaries and the compact start range', () => {
    const html = renderPagination(1, 20);
    const first = getPaginationActionMarkup(html, 'Первая страница');
    const previous = getPaginationActionMarkup(html, 'Предыдущая страница');

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
    expect(first).toContain('role="link"');
    expect(first).not.toContain('href=');
    expect(previous).toContain('role="link"');
    expect(previous).not.toContain('href=');
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

  it('preserves final boundary controls when the current page exceeds the page count', () => {
    const html = renderPagination(100, 3);
    const first = getPaginationActionMarkup(html, 'Первая страница');
    const previous = getPaginationActionMarkup(html, 'Предыдущая страница');
    const next = getPaginationActionMarkup(html, 'Следующая страница');
    const last = getPaginationActionMarkup(html, 'Последняя страница');

    expect(html.match(/aria-disabled="true"/g) ?? []).toHaveLength(2);
    expect(next).toContain('aria-disabled="true"');
    expect(next).not.toContain('href=');
    expect(last).toContain('aria-disabled="true"');
    expect(last).not.toContain('href=');
    expect(first).not.toContain('aria-disabled=');
    expect(first).toContain('href="/?search=spa"');
    expect(previous).not.toContain('aria-disabled=');
    expect(previous).toContain('href="/?search=spa&amp;page=99"');
  });
});
