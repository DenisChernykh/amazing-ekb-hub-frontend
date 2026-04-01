import type {
  PlaceDetailResponseDto,
  PlaceListResponseDto,
  PlaceMaterialPreviewHttpDto,
  PlaceSummaryHttpDto,
} from '@/modules/place/api/http/place.http.schema';
import type {
  PlaceCategory,
  PlaceDetail,
  PlaceList,
  PlaceMaterialPlatform,
  PlaceMaterialPreview,
  PlaceMaterialType,
  PlaceStatus,
  PlaceSummary,
} from '@/modules/place/model';

/**
 * Нормализует HTTP DTO категорию места в доменное значение.
 *
 * @param category - Категория из backend DTO.
 * @returns Категория доменной модели frontend.
 */
function mapPlaceCategoryDtoToModel(category: PlaceSummaryHttpDto['category']): PlaceCategory {
  switch (category) {
    case 'pools':
    case 'spa':
    case 'cafe':
    case 'hotels':
    case 'workshops':
      return category;
  }
}

/**
 * Нормализует HTTP DTO статус места в доменное значение.
 *
 * @param status - Статус из backend DTO.
 * @returns Статус доменной модели frontend.
 */
function mapPlaceStatusDtoToModel(status: PlaceSummaryHttpDto['status']): PlaceStatus {
  switch (status) {
    case 'active':
    case 'hidden':
      return status;
  }
}

/**
 * Нормализует HTTP DTO платформу материала в доменное значение.
 *
 * @param platform - Платформа из backend DTO.
 * @returns Платформа материала доменной модели frontend.
 */
function mapPlaceMaterialPlatformDtoToModel(
  platform: PlaceMaterialPreviewHttpDto['platform'],
): PlaceMaterialPlatform {
  switch (platform) {
    case 'dzen':
    case 'telegram':
    case 'instagram':
      return platform;
  }
}

/**
 * Нормализует HTTP DTO тип материала в доменное значение.
 *
 * @param type - Тип материала из backend DTO.
 * @returns Тип материала доменной модели frontend.
 */
function mapPlaceMaterialTypeDtoToModel(
  type: PlaceMaterialPreviewHttpDto['type'],
): PlaceMaterialType {
  switch (type) {
    case 'post':
    case 'reel':
    case 'video':
      return type;
  }
}

/**
 * Преобразует один place DTO в доменную модель.
 *
 * @param dto - DTO карточки места из HTTP-ответа.
 * @returns Доменную модель карточки места.
 */
export function mapPlaceSummaryDtoToModel(dto: PlaceSummaryHttpDto): PlaceSummary {
  return {
    id: dto.id,
    title: dto.title,
    summary: dto.summary,
    tags: [...dto.tags],
    category: mapPlaceCategoryDtoToModel(dto.category),
    status: mapPlaceStatusDtoToModel(dto.status),
    popularityWeight: dto.popularityWeight,
  };
}

/**
 * Преобразует список мест из HTTP DTO в доменную модель.
 *
 * @param dto - DTO ответа `GET /places`.
 * @returns Доменную модель списка мест.
 */
export function mapPlaceListDtoToModel(dto: PlaceListResponseDto): PlaceList {
  return {
    items: dto.items.map(mapPlaceSummaryDtoToModel),
    total: dto.total,
    page: dto.page,
    pageSize: dto.pageSize,
  };
}

/**
 * Преобразует DTO закрепленного материала в доменную preview-модель.
 *
 * @param dto - DTO закрепленного материала из detail-ответа места.
 * @returns Доменную preview-модель материала.
 */
export function mapPlaceMaterialPreviewDtoToModel(
  dto: PlaceMaterialPreviewHttpDto,
): PlaceMaterialPreview {
  return {
    id: dto.id,
    placeId: dto.placeId,
    platform: mapPlaceMaterialPlatformDtoToModel(dto.platform),
    type: mapPlaceMaterialTypeDtoToModel(dto.type),
    title: dto.title,
    publishedAt: dto.publishedAt,
    durationSec: dto.durationSec,
    url: dto.url,
  };
}

/**
 * Преобразует detail DTO места в доменную detail-модель.
 *
 * @param dto - DTO ответа `GET /places/{placeId}`.
 * @returns Доменную detail-модель места.
 */
export function mapPlaceDetailDtoToModel(dto: PlaceDetailResponseDto): PlaceDetail {
  return {
    ...mapPlaceSummaryDtoToModel(dto),
    pinnedMaterial: dto.pinnedMaterial
      ? mapPlaceMaterialPreviewDtoToModel(dto.pinnedMaterial)
      : null,
    counters: {
      dzen: dto.counters.dzen,
      telegram: dto.counters.telegram,
      instagram: dto.counters.instagram,
    },
  };
}
