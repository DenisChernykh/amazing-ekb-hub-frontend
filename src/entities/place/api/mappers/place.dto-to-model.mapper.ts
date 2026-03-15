import {
  PlaceListResponseDto,
  PlaceSummaryHttpDto,
} from '@/entities/place/api/http/place.http.schema';
import { PlaceCategory, PlaceList, PlaceStatus, PlaceSummary } from '@/entities/place/model/place';

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
