import z from 'zod';

/**
 * Схема допустимых категорий места в HTTP DTO.
 */
export const PlaceCategorySchema = z.enum(['pools', 'spa', 'cafe', 'hotels', 'workshops']);

/**
 * Схема допустимых статусов места в HTTP DTO.
 */
export const PlaceStatusSchema = z.enum(['active', 'hidden']);

/**
 * Схема допустимых платформ материала внутри place detail.
 */
export const PlaceMaterialPlatformSchema = z.enum(['dzen', 'telegram', 'instagram']);

/**
 * Схема допустимых типов материала внутри place detail.
 */
export const PlaceMaterialTypeSchema = z.enum(['post', 'reel', 'video']);

/**
 * Схема одного элемента из `GET /places`.
 */
export const PlaceSummaryHttpDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  tags: z.array(z.string()),
  category: PlaceCategorySchema,
  status: PlaceStatusSchema,
  popularityWeight: z.number().int(),
});

/**
 * Схема успешного payload списка мест.
 */
export const PlaceListResponseSchema = z.object({
  items: z.array(PlaceSummaryHttpDtoSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
});

/**
 * Схема закрепленного материала внутри `GET /places/{placeId}`.
 */
export const PlaceMaterialPreviewHttpDtoSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  platform: PlaceMaterialPlatformSchema,
  type: PlaceMaterialTypeSchema,
  title: z.string(),
  publishedAt: z.string(),
  durationSec: z.number().int().nullable(),
  url: z.string(),
});

/**
 * Схема счетчиков материалов по платформам в detail-ответе места.
 */
export const PlaceCountersHttpDtoSchema = z.object({
  dzen: z.number().int(),
  telegram: z.number().int(),
  instagram: z.number().int(),
});

/**
 * Схема успешного payload detail-страницы места.
 */
export const PlaceDetailResponseSchema = PlaceSummaryHttpDtoSchema.extend({
  pinnedMaterial: PlaceMaterialPreviewHttpDtoSchema.nullable(),
  counters: PlaceCountersHttpDtoSchema,
});

/**
 * DTO одного места после runtime-валидации.
 */
export type PlaceSummaryHttpDto = z.output<typeof PlaceSummaryHttpDtoSchema>;

/**
 * DTO ответа списка мест после runtime-валидации.
 */
export type PlaceListResponseDto = z.output<typeof PlaceListResponseSchema>;

/**
 * DTO pinned material после runtime-валидации.
 */
export type PlaceMaterialPreviewHttpDto = z.output<typeof PlaceMaterialPreviewHttpDtoSchema>;

/**
 * DTO detail-ответа места после runtime-валидации.
 */
export type PlaceDetailResponseDto = z.output<typeof PlaceDetailResponseSchema>;
