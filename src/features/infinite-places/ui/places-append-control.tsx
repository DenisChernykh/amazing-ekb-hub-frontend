'use client';

import type { RefObject } from 'react';
import type { InfinitePlacesStatus } from '../model/infinite-places-state';

type PlacesAppendControlProps = {
  status: InfinitePlacesStatus;
  sentinelRef: RefObject<HTMLDivElement | null>;
  onRetry: () => void;
};

/** Отображает sentinel, loader или retry-контрол бесконечной ленты. */
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
