import { getMaterialCountLabel, getPlatformLabel, type Platform } from '@/modules/material';
import { mapMaterialToDetailItemViewModel } from './map-material-to-detail-item-view-model';
import type {
  BuildPlaceDetailSectionHref,
  PlaceDetailPlatformPages,
  PlaceDetailSectionLoadResult,
  PlaceDetailSectionPaginationViewModel,
  PlaceDetailSectionViewModel,
} from './place-detail-section.view-model.types';

/**
 * Строит view model одной платформенной секции detail-экрана.
 *
 * @param args - Данные секции, результат загрузки и href-builder пагинации.
 * @returns View model платформенной секции.
 */
export function buildPlaceDetailSectionViewModel(args: {
  placeId: string;
  platform: Platform;
  counter: number;
  platformPages: PlaceDetailPlatformPages;
  materialResult: PlaceDetailSectionLoadResult | undefined;
  buildDetailHref: BuildPlaceDetailSectionHref;
}): PlaceDetailSectionViewModel {
  const { placeId, platform, counter, platformPages, materialResult, buildDetailHref } = args;
  const title = getPlatformLabel(platform);

  if (counter === 0) {
    return {
      kind: 'empty',
      platform,
      title,
      countLabel: getMaterialCountLabel(0),
      description: 'Пока на этой платформе материалов для места нет.',
    };
  }

  if (!materialResult || materialResult.kind === 'error') {
    return {
      kind: 'error',
      platform,
      title,
      countLabel: getMaterialCountLabel(counter),
      message: materialResult?.message ?? 'Не удалось загрузить материалы платформы.',
      requestId: materialResult?.requestId,
    };
  }

  const { items, total, page, pageSize } = materialResult.data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    kind: 'success',
    platform,
    title,
    countLabel: getMaterialCountLabel(total),
    items: items.map(mapMaterialToDetailItemViewModel),
    emptyPageDescription: 'На этой странице материалов пока нет.',
    pagination:
      totalPages > 1
        ? buildSectionPaginationViewModel({
            placeId,
            platform,
            platformPages,
            page,
            totalPages,
            buildDetailHref,
          })
        : undefined,
  };
}

/**
 * Строит pagination view model для одной платформенной секции.
 *
 * @param args - Платформа, текущая страница, общее число страниц и href-builder.
 * @returns Pagination view model.
 */
function buildSectionPaginationViewModel(args: {
  placeId: string;
  platform: Platform;
  platformPages: PlaceDetailPlatformPages;
  page: number;
  totalPages: number;
  buildDetailHref: BuildPlaceDetailSectionHref;
}): PlaceDetailSectionPaginationViewModel {
  const { placeId, platform, platformPages, page, totalPages, buildDetailHref } = args;
  const hrefByPage: Record<number, string> = {};

  for (let targetPage = 1; targetPage <= totalPages; targetPage += 1) {
    hrefByPage[targetPage] = buildDetailHref({
      placeId,
      platform,
      platformPages,
      targetPage,
    });
  }

  return {
    page,
    totalPages,
    hrefByPage,
  };
}
