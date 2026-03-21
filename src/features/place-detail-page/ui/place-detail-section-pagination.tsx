import { PlaceDetailSectionPaginationViewModel } from '@/features/place-detail-page/model/place-detail-page.view-model.types';
import AppLink from '@/shared/ui/app-link';
import { Pagination, PaginationItem } from '@mui/material';

/**
 * Параметры пагинации платформенной секции.
 */
export interface PlaceDetailSectionPaginationProps {
  pagination: PlaceDetailSectionPaginationViewModel;
}

/**
 * Рендерит MUI Pagination для одной платформенной секции.
 *
 * @param pagination - View model пагинации.
 * @returns Пагинацию с href на detail-route.
 */
export function PlaceDetailSectionPagination({
  pagination,
}: Readonly<PlaceDetailSectionPaginationProps>) {
  return (
    <Pagination
      page={pagination.page}
      count={pagination.totalPages}
      color="primary"
      renderItem={(item) => {
        const targetPage = item.page ?? pagination.page;

        return (
          <PaginationItem
            {...item}
            component={AppLink}
            href={pagination.hrefByPage[targetPage] ?? pagination.hrefByPage[pagination.page]}
          />
        );
      }}
    />
  );
}
