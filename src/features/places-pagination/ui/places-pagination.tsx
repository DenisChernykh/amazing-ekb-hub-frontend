'use client';

import { Pagination, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { buildPlacesPaginationHref } from '../lib/build-places-pagination-href';
import type { PlacesPaginationModel } from '../model/types';

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

  /**
   * Это хелпер. Переводит выбранную страницу MUI Pagination в URL каталога.
   *
   * @param _event - Browser event от MUI Pagination.
   * @param value - Выбранный номер страницы.
   */
  function handlePageChange(_event: React.ChangeEvent<unknown>, value: number) {
    router.push(buildPlacesPaginationHref({ currentSearchParams, page: value }));
  }

  return (
    <Stack
      aria-label="Пагинация мест"
      component="nav"
      direction="row"
      justifyContent="center"
      alignItems="center"
      mt={4.25}
    >
      <Pagination
        color="primary"
        count={pageCount}
        onChange={handlePageChange}
        page={page}
        shape="rounded"
        showFirstButton
        showLastButton
      />
    </Stack>
  );
}
