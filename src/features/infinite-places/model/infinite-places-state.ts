import type { CategoryPlacesPage, PlaceCardModel } from '@/entities/place';

/** Состояние жизненного цикла подгрузки мест. */
export type InfinitePlacesStatus = 'idle' | 'loading' | 'error' | 'end';

/** Полное клиентское состояние бесконечной ленты мест. */
export type InfinitePlacesState = {
  items: PlaceCardModel[];
  page: number;
  total: number;
  status: InfinitePlacesStatus;
};

/** События, изменяющие состояние бесконечной ленты мест. */
export type InfinitePlacesAction =
  | { type: 'request' }
  | { type: 'success'; page: CategoryPlacesPage }
  | { type: 'failure' }
  | { type: 'retry' }
  | { type: 'cancel' };

/** Создаёт начальное состояние из server-rendered первой страницы. */
export function createInfinitePlacesState(page: CategoryPlacesPage): InfinitePlacesState {
  return {
    items: page.items,
    page: page.page,
    total: page.total,
    status: page.items.length >= page.total ? 'end' : 'idle',
  };
}

/** Применяет событие загрузки к состоянию бесконечной ленты. */
export function infinitePlacesReducer(
  state: InfinitePlacesState,
  action: InfinitePlacesAction,
): InfinitePlacesState {
  if (action.type === 'request' || action.type === 'retry') {
    if (state.status !== 'idle' && state.status !== 'error') return state;
    return { ...state, status: 'loading' };
  }

  if (action.type === 'failure') {
    return state.status === 'loading' ? { ...state, status: 'error' } : state;
  }

  if (action.type === 'cancel') {
    return state.status === 'loading' ? { ...state, status: 'idle' } : state;
  }

  if (state.status !== 'loading') return state;

  const knownIds = new Set(state.items.map(({ id }) => id));
  const newItems = action.page.items.filter(({ id }) => !knownIds.has(id));
  const items = [...state.items, ...newItems];
  const ended = newItems.length === 0 || items.length >= action.page.total;

  return {
    items,
    page: action.page.page,
    total: action.page.total,
    status: ended ? 'end' : 'idle',
  };
}
