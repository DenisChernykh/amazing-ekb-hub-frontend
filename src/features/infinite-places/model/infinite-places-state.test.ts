import type { CategoryPlacesPage, PlaceCardModel } from '@/entities/place';
import { describe, expect, it } from 'vitest';
import {
  createInfinitePlacesState,
  infinitePlacesReducer,
  type InfinitePlacesState,
} from './infinite-places-state';

/** Создаёт последовательность карточек мест для reducer-сценариев. */
function createItems(from: number, to: number): PlaceCardModel[] {
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

/** Создаёт страницу мест для reducer-сценариев. */
function createPage(items: PlaceCardModel[], page: number, total = 40): CategoryPlacesPage {
  return { items, page, pageSize: 20, total };
}

const INITIAL_PAGE = createPage(createItems(1, 20), 1);

describe('infinitePlacesReducer', () => {
  it('creates an idle state from a non-final initial page', () => {
    expect(createInfinitePlacesState(INITIAL_PAGE)).toEqual({
      items: INITIAL_PAGE.items,
      page: 1,
      total: 40,
      status: 'idle',
    });
  });

  it('creates an end state when the initial page already contains the total', () => {
    expect(createInfinitePlacesState(createPage(createItems(1, 20), 1, 20)).status).toBe('end');
  });

  it('moves idle to loading on request', () => {
    const state = createInfinitePlacesState(INITIAL_PAGE);

    expect(infinitePlacesReducer(state, { type: 'request' })).toEqual({
      ...state,
      status: 'loading',
    });
  });

  it('appends unseen ids in response order and ignores duplicate ids', () => {
    const loading = infinitePlacesReducer(createInfinitePlacesState(INITIAL_PAGE), {
      type: 'request',
    });
    const result = infinitePlacesReducer(loading, {
      type: 'success',
      page: createPage(createItems(20, 39), 2),
    });

    expect(result.items.map(({ id }) => id)).toEqual(createItems(1, 39).map(({ id }) => id));
    expect(result).toMatchObject({ page: 2, total: 40, status: 'idle' });
  });

  it('ends when the merged item count reaches the total', () => {
    const loading = infinitePlacesReducer(createInfinitePlacesState(INITIAL_PAGE), {
      type: 'request',
    });
    const result = infinitePlacesReducer(loading, {
      type: 'success',
      page: createPage(createItems(21, 40), 2),
    });

    expect(result.status).toBe('end');
    expect(result.items).toHaveLength(40);
  });

  it('ends when a response contributes no unseen ids', () => {
    const loading = infinitePlacesReducer(createInfinitePlacesState(INITIAL_PAGE), {
      type: 'request',
    });
    const result = infinitePlacesReducer(loading, {
      type: 'success',
      page: createPage(createItems(1, 20), 2),
    });

    expect(result.status).toBe('end');
    expect(result.items).toEqual(INITIAL_PAGE.items);
  });

  it('keeps every existing item and sets error on failure', () => {
    const loading = infinitePlacesReducer(createInfinitePlacesState(INITIAL_PAGE), {
      type: 'request',
    });
    const result = infinitePlacesReducer(loading, { type: 'failure' });

    expect(result).toEqual({ ...loading, status: 'error' });
    expect(result.items).toEqual(INITIAL_PAGE.items);
  });

  it('moves error to loading on retry', () => {
    const error: InfinitePlacesState = {
      ...createInfinitePlacesState(INITIAL_PAGE),
      status: 'error',
    };

    expect(infinitePlacesReducer(error, { type: 'retry' })).toEqual({
      ...error,
      status: 'loading',
    });
  });

  it('moves loading to idle on cancellation without changing feed data', () => {
    const loading = infinitePlacesReducer(createInfinitePlacesState(INITIAL_PAGE), {
      type: 'request',
    });

    expect(infinitePlacesReducer(loading, { type: 'cancel' })).toEqual({
      ...loading,
      status: 'idle',
    });
  });

  it.each(['idle', 'error', 'end'] as const)(
    'keeps the same state when cancellation arrives while status is %s',
    (status) => {
      const state: InfinitePlacesState = {
        ...createInfinitePlacesState(INITIAL_PAGE),
        status,
      };

      expect(infinitePlacesReducer(state, { type: 'cancel' })).toBe(state);
    },
  );

  it('ignores a stale success after the active request was cancelled', () => {
    const loading = infinitePlacesReducer(createInfinitePlacesState(INITIAL_PAGE), {
      type: 'request',
    });
    const cancelled = infinitePlacesReducer(loading, { type: 'cancel' });

    expect(
      infinitePlacesReducer(cancelled, {
        type: 'success',
        page: createPage(createItems(21, 40), 2),
      }),
    ).toBe(cancelled);
  });

  it.each(['loading', 'end'] as const)(
    'keeps the same state when request arrives while status is %s',
    (status) => {
      const state: InfinitePlacesState = {
        ...createInfinitePlacesState(INITIAL_PAGE),
        status,
      };

      expect(infinitePlacesReducer(state, { type: 'request' })).toBe(state);
    },
  );
});
