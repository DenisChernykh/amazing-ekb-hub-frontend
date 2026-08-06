import { buildCollectionHref } from '@/entities/collection';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/ui';

type PageItem = number | 'ellipsis';

function buildPageItems(page: number, lastPage: number): PageItem[] {
  const visiblePages = new Set([1, lastPage, page - 1, page, page + 1]);
  const pages = [...visiblePages]
    .filter((value) => value >= 1 && value <= lastPage)
    .sort((a, b) => a - b);
  const items: PageItem[] = [];

  pages.forEach((value, index) => {
    if (index > 0 && value - pages[index - 1] > 1) items.push('ellipsis');
    items.push(value);
  });

  return items;
}

function buildPageHref(collectionSlug: string, page: number): string {
  const href = buildCollectionHref(collectionSlug);
  return page === 1 ? href : `${href}?page=${page}`;
}

/** Рендерит bounded server-side pagination подборки с canonical page-one href. */
export function CollectionPagination({
  collectionSlug,
  page,
  pageSize,
  total,
}: Readonly<{
  collectionSlug: string;
  page: number;
  pageSize: number;
  total: number;
}>) {
  const lastPage = Math.ceil(total / pageSize);
  if (total === 0 || lastPage <= 1) return null;

  return (
    <Pagination className="mt-10">
      <PaginationContent>
        {page > 1 && (
          <PaginationItem>
            <PaginationPrevious href={buildPageHref(collectionSlug, page - 1)} text="Предыдущая" />
          </PaginationItem>
        )}
        {buildPageItems(page, lastPage).map((item, index) => (
          <PaginationItem key={item === 'ellipsis' ? `ellipsis-${index}` : item}>
            {item === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href={buildPageHref(collectionSlug, item)}
                isActive={item === page}
                aria-label={`Перейти на страницу ${item}`}
              >
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        {page < lastPage && (
          <PaginationItem>
            <PaginationNext href={buildPageHref(collectionSlug, page + 1)} text="Следующая" />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
