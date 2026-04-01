import type {
  MaterialHttpDto,
  MaterialListResponseDto,
} from '@/modules/material/api/http/material.http.schema';
import type { Material, MaterialList } from '@/modules/material/model';

/**
 * Преобразует один материал из HTTP DTO в доменную модель.
 *
 * @param dto - DTO одного материала.
 * @returns Доменную модель материала.
 */
export function mapMaterialDtoToModel(dto: MaterialHttpDto): Material {
  return {
    id: dto.id,
    placeId: dto.placeId,
    platform: dto.platform,
    type: dto.type,
    title: dto.title,
    publishedAt: dto.publishedAt,
    durationSec: dto.durationSec ?? null,
    url: dto.url,
  };
}

/**
 * Преобразует список материалов из HTTP DTO в доменную модель.
 *
 * @param dto - DTO ответа `GET /places/{placeId}/materials`.
 * @returns Доменную модель списка материалов.
 */
export function mapMaterialListDtoToModel(dto: MaterialListResponseDto): MaterialList {
  return {
    items: dto.items.map(mapMaterialDtoToModel),
    total: dto.total,
    page: dto.page,
    pageSize: dto.pageSize,
  };
}
