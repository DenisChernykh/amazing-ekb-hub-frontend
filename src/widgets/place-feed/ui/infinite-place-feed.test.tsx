// @vitest-environment jsdom

import type { CategoryPlacesPage } from '@/entities/place';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InfinitePlaceFeed } from './infinite-place-feed';

type ObserverCallback = ConstructorParameters<typeof IntersectionObserver>[0];

/** Управляемый IntersectionObserver для клиентских runtime-сценариев. */
class IntersectionObserverMock implements IntersectionObserver {
  static instances: IntersectionObserverMock[] = [];

  readonly root = null;
  readonly rootMargin: string;
  readonly thresholds = [0];
  private readonly callback: ObserverCallback;
  private target: Element | null = null;

  constructor(callback: ObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.rootMargin = options?.rootMargin ?? '0px';
    IntersectionObserverMock.instances.push(this);
  }

  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);

  observe = vi.fn((target: Element) => {
    this.target = target;
  });

  unobserve = vi.fn();

  trigger(isIntersecting = true) {
    if (!this.target) throw new Error('IntersectionObserver has no observed target');

    this.callback(
      [
        {
          isIntersecting,
          target: this.target,
        } as IntersectionObserverEntry,
      ],
      this,
    );
  }
}

/** Создаёт последовательность карточек мест для runtime-сценариев. */
function createItems(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, index) => {
    const id = String(from + index);

    return {
      id,
      slug: `place-${id}`,
      title: `Место ${id}`,
      coverImageUrl: null,
    };
  });
}

/** Создаёт страницу мест для runtime-сценариев. */
function createPage(
  items: CategoryPlacesPage['items'],
  page: number,
  total: number,
): CategoryPlacesPage {
  return { items, page, pageSize: 20, total };
}

/** Создаёт JSON response страницы мест. */
function jsonResponse(page: CategoryPlacesPage, status = 200) {
  return Promise.resolve(
    new Response(status === 200 ? JSON.stringify(page) : null, {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

/** Создаёт управляемый Promise ответа для проверки loading-состояния. */
function deferredResponse() {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}

describe('InfinitePlaceFeed client runtime', () => {
  let container: HTMLDivElement;
  let root: Root;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    (
      globalThis as typeof globalThis & {
        IS_REACT_ACT_ENVIRONMENT: boolean;
      }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    IntersectionObserverMock.instances = [];
    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('starts from SSR data, requests each next page once, appends in order, and ends', async () => {
    const page2 = deferredResponse();
    fetchMock
      .mockImplementationOnce(() => page2.promise)
      .mockImplementationOnce(() => jsonResponse(createPage(createItems(40, 45), 3, 45)));

    await act(async () => {
      root.render(
        createElement(InfinitePlaceFeed, {
          initialPage: createPage(createItems(1, 20), 1, 45),
          categorySlug: 'spa',
        }),
      );
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(container.querySelectorAll('article')).toHaveLength(20);
    expect(IntersectionObserverMock.instances).toHaveLength(1);

    await act(async () => {
      IntersectionObserverMock.instances[0]?.trigger();
      IntersectionObserverMock.instances[0]?.trigger();
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith('/api/categories/spa/places?page=2', {
      signal: expect.any(AbortSignal),
    });
    expect(container.querySelector('[role="status"]')).not.toBeNull();

    await act(async () => {
      page2.resolve(await jsonResponse(createPage(createItems(20, 39), 2, 45)));
    });

    expect(container.querySelectorAll('article')).toHaveLength(39);
    expect(
      Array.from(container.querySelectorAll('article h2'), ({ textContent }) => textContent),
    ).toEqual(createItems(1, 39).map(({ title }) => title));
    expect(IntersectionObserverMock.instances).toHaveLength(2);

    await act(async () => {
      IntersectionObserverMock.instances[1]?.trigger();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith('/api/categories/spa/places?page=3', {
      signal: expect.any(AbortSignal),
    });
    expect(container.querySelectorAll('article')).toHaveLength(45);
    expect(container.querySelector('.places-append-control')).toBeNull();
  });

  it('keeps existing items after 503 and retries the same page successfully', async () => {
    fetchMock
      .mockImplementationOnce(() => jsonResponse(createPage([], 2, 40), 503))
      .mockImplementationOnce(() => jsonResponse(createPage(createItems(21, 40), 2, 40)));

    await act(async () => {
      root.render(
        createElement(InfinitePlaceFeed, {
          initialPage: createPage(createItems(1, 20), 1, 40),
          categorySlug: 'spa',
        }),
      );
    });

    await act(async () => {
      IntersectionObserverMock.instances[0]?.trigger();
    });

    expect(container.querySelectorAll('article')).toHaveLength(20);
    const retryButton = Array.from(container.querySelectorAll('button')).find(
      ({ textContent }) => textContent === 'Повторить',
    );
    expect(retryButton).toBeDefined();

    await act(async () => {
      retryButton?.click();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/categories/spa/places?page=2',
      '/api/categories/spa/places?page=2',
    ]);
    expect(container.querySelectorAll('article')).toHaveLength(40);
    expect(container.querySelector('.places-append-control')).toBeNull();
  });

  it('aborts an in-flight page request on unmount without rendering an error', async () => {
    let requestSignal: AbortSignal | undefined;
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    fetchMock.mockImplementationOnce(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          requestSignal = init.signal as AbortSignal;
          requestSignal.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        }),
    );

    await act(async () => {
      root.render(
        createElement(InfinitePlaceFeed, {
          initialPage: createPage(createItems(1, 20), 1, 40),
          categorySlug: 'spa',
        }),
      );
    });

    await act(async () => {
      IntersectionObserverMock.instances[0]?.trigger();
    });

    expect(container.querySelector('[role="status"]')).not.toBeNull();

    await act(async () => {
      root.unmount();
    });

    expect(requestSignal?.aborted).toBe(true);
    expect(container.innerHTML).toBe('');
    expect(consoleError).not.toHaveBeenCalled();
    root = createRoot(container);
  });
});
