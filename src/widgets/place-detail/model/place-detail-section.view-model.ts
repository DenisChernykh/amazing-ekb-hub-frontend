import {
  buildMaterialMetaChips,
  getMaterialCountLabel,
  getPlatformLabel,
  Material,
  MaterialListResult,
  Platform,
} from '@/entities/material';
import { getRemoteFailureMessage } from '@/shared/failures';
import {
  buildPlaceDetailPageHref,
  PlaceDetailPlatformPages,
} from '@/widgets/place-detail/model/place-detail-query-contract';
import {
  PlaceDetailMaterialViewModel,
  PlaceDetailSectionPaginationViewModel,
  PlaceDetailSectionViewModel,
} from '@/widgets/place-detail/model/place-detail-screen.view-model.types';

/**
 * Строит view model одной платформенной секции detail-экрана.
 */
export function buildPlaceDetailSectionViewModel(args: {
  placeId: string;
  platform: Platform;
  counter: number;
  platformPages: PlaceDetailPlatformPages;
  materialResult: MaterialListResult | undefined;
}): PlaceDetailSectionViewModel {
  const { placeId, platform, counter, platformPages, materialResult } = args;
  const title = getPlatformLabel(platform);

  if (counter === 0) {
    return {
      kind: 'empty',
      platform,
      title,
      countLabel: getMaterialCountLabel(0),
      description: 'Пока на этой платформе материалов для места нет',
    };
  }

  if (!materialResult || !materialResult.ok) {
    return {
      kind: 'error',
      platform,
      title,
      countLabel: getMaterialCountLabel(counter),
      message: materialResult
        ? getRemoteFailureMessage(materialResult.error)
        : 'Не удалось загрузить материалы платформы',
    };
  }

  const { items, total, page, pageSize } = materialResult.data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    kind: 'success',
    platform,
    title,
    countLabel: getMaterialCountLabel(total),
    items: items.map(mapMaterialToViewModel),
    emptyPageDescription: 'На этой странице материалов пока нет.',
    pagination:
      totalPages > 1
        ? buildSectionPaginationViewModel({
            placeId,
            platform,
            platformPages,
            page,
            totalPages,
          })
        : undefined,
  };
}

/**
 * Преобразует доменный материал в presentation-ready элемент секции.
 */
function mapMaterialToViewModel(material: Material): PlaceDetailMaterialViewModel {
  return {
    id: material.id,
    title: material.title,
    href: material.url,
    metaChips: buildMaterialMetaChips(material),
  };
}

/**
 * Строит pagination view model для одной платформенной секции.
 */
function buildSectionPaginationViewModel(args: {
  placeId: string;
  platform: Platform;
  platformPages: PlaceDetailPlatformPages;
  page: number;
  totalPages: number;
}): PlaceDetailSectionPaginationViewModel {
  const { placeId, platform, platformPages, page, totalPages } = args;
  const hrefByPage: Record<number, string> = {};

  for (let targetPage = 1; targetPage <= totalPages; targetPage += 1) {
    hrefByPage[targetPage] = buildPlaceDetailPageHref({
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
