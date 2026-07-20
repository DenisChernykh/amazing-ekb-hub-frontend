'use client';

import type { CategoryPlacesPage } from '@/entities/place';
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { fetchNextCategoryPlacesPage } from '../api/fetch-next-category-places-page';
import { createInfinitePlacesState, infinitePlacesReducer } from './infinite-places-state';

/** Управляет последовательной клиентской подгрузкой страниц мест. */
export function useInfinitePlaces({
  initialPage,
  categorySlug,
}: Readonly<{ initialPage: CategoryPlacesPage; categorySlug: string }>) {
  const [state, dispatch] = useReducer(
    infinitePlacesReducer,
    initialPage,
    createInfinitePlacesState,
  );
  const stateRef = useRef(state);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  stateRef.current = state;

  const loadNextPage = useCallback(
    async (retry = false) => {
      const current = stateRef.current;
      const allowed = retry ? current.status === 'error' : current.status === 'idle';
      if (!allowed || requestRef.current) return;

      dispatch({ type: retry ? 'retry' : 'request' });
      const controller = new AbortController();
      requestRef.current = controller;

      try {
        const page = await fetchNextCategoryPlacesPage({
          categorySlug,
          page: current.page + 1,
          signal: controller.signal,
        });
        dispatch({ type: 'success', page });
      } catch {
        if (!controller.signal.aborted) dispatch({ type: 'failure' });
      } finally {
        if (requestRef.current === controller) requestRef.current = null;
      }
    },
    [categorySlug],
  );

  useEffect(() => () => requestRef.current?.abort(), []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || state.status !== 'idle') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.unobserve(sentinel);
        void loadNextPage();
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNextPage, state.status]);

  return {
    items: state.items,
    status: state.status,
    sentinelRef,
    retry: () => void loadNextPage(true),
  };
}
