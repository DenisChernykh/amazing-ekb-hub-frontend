'use client';

import type { CategoryPlacesPage } from '@/entities/place';
import { PlaceFeed } from '@/widgets/place-feed';
import { useCallback, useEffect, useReducer, useRef, type RefObject } from 'react';
import { fetchNextCategoryPlacesPage } from '../api/fetch-next-category-places-page';
import {
  createInfinitePlacesState,
  infinitePlacesReducer,
  type InfinitePlacesStatus,
} from '../model/infinite-places-state';

type PlacesAppendControlProps = {
  status: InfinitePlacesStatus;
  sentinelRef: RefObject<HTMLDivElement | null>;
  onRetry: () => void;
};

export function PlacesAppendControl({
  status,
  sentinelRef,
  onRetry,
}: Readonly<PlacesAppendControlProps>) {
  if (status === 'end') return null;

  return (
    <div className="places-append-control">
      {status === 'idle' && (
        <div
          ref={sentinelRef}
          className="h-12 w-full"
          data-category-places-sentinel="true"
          aria-hidden="true"
        />
      )}

      {status === 'loading' && (
        <div className="places-append-loader" role="status" aria-live="polite">
          <span className="sr-only">Загружаем следующие места</span>
          <span aria-hidden="true" className="places-append-loader-track">
            <span className="places-append-loader-segment" />
          </span>
        </div>
      )}

      {status === 'error' && (
        <button
          type="button"
          onClick={onRetry}
          className="border border-black bg-white px-5 py-3 text-sm font-medium text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
        >
          Повторить
        </button>
      )}
    </div>
  );
}

export function InfinitePlaces({
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

  return (
    <>
      <PlaceFeed items={state.items} />
      <PlacesAppendControl
        status={state.status}
        sentinelRef={sentinelRef}
        onRetry={() => void loadNextPage(true)}
      />
    </>
  );
}
