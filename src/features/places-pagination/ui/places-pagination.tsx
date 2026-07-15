'use client';

import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/shared/ui';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';
import { buildPlacesPaginationHref } from '../lib/build-places-pagination-href';
import { buildPlacesPaginationItems } from '../lib/build-places-pagination-items';
import type { PlacesPaginationModel } from '../model/types';
import { PlacesPaginationAction } from './places-pagination-action';

interface PlacesPaginationProps {
  pagination: PlacesPaginationModel;
  currentSearchParams: string;
}

/**
 * Рендерит постраничную навигацию каталога мест.
 *
 * @param props - Текущее состояние пагинации.
 */
export function PlacesPagination({
  pagination,
  currentSearchParams,
}: Readonly<PlacesPaginationProps>) {
  const { page, pageCount } = pagination;
  const router = useRouter();

  if (pageCount <= 1) {
    return null;
  }

  const items = buildPlacesPaginationItems({ page, pageCount });
  const isFirstPage = page === 1;
  const isLastPage = page === pageCount;

  /**
   * Это хелпер. Переводит pagination action в canonical URL каталога.
   *
   * @param event - Click event semantic anchor.
   * @param nextPage - Выбранный номер страницы.
   */
  function handlePageChange(event: MouseEvent<HTMLAnchorElement>, nextPage: number) {
    event.preventDefault();

    if (nextPage === page) {
      return;
    }

    router.push(buildPlacesPaginationHref({ currentSearchParams, page: nextPage }));
  }

  return (
    <Pagination aria-label="Пагинация мест" className="mt-[34px]">
      <PaginationContent className="max-w-full gap-1.5">
        <PaginationItem>
          <PlacesPaginationAction
            ariaLabel="Первая страница"
            currentSearchParams={currentSearchParams}
            disabled={isFirstPage}
            onNavigate={handlePageChange}
            page={1}
          >
            <ChevronsLeftIcon />
          </PlacesPaginationAction>
        </PaginationItem>
        <PaginationItem>
          <PlacesPaginationAction
            ariaLabel="Предыдущая страница"
            currentSearchParams={currentSearchParams}
            disabled={isFirstPage}
            onNavigate={handlePageChange}
            page={Math.max(1, page - 1)}
          >
            <ChevronLeftIcon />
          </PlacesPaginationAction>
        </PaginationItem>

        {items.map((item) => {
          if (item.type === 'ellipsis') {
            return (
              <PaginationItem key={item.key} className="hidden min-[600px]:block">
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          const isActive = item.page === page;

          return (
            <PaginationItem
              key={item.page}
              className={isActive ? undefined : 'hidden min-[600px]:block'}
            >
              <PlacesPaginationAction
                ariaLabel={`Страница ${item.page}${isActive ? ', текущая' : ''}`}
                currentSearchParams={currentSearchParams}
                isActive={isActive}
                onNavigate={handlePageChange}
                page={item.page}
              >
                {item.page}
              </PlacesPaginationAction>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PlacesPaginationAction
            ariaLabel="Следующая страница"
            currentSearchParams={currentSearchParams}
            disabled={isLastPage}
            onNavigate={handlePageChange}
            page={Math.min(pageCount, page + 1)}
          >
            <ChevronRightIcon />
          </PlacesPaginationAction>
        </PaginationItem>
        <PaginationItem>
          <PlacesPaginationAction
            ariaLabel="Последняя страница"
            currentSearchParams={currentSearchParams}
            disabled={isLastPage}
            onNavigate={handlePageChange}
            page={pageCount}
          >
            <ChevronsRightIcon />
          </PlacesPaginationAction>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
