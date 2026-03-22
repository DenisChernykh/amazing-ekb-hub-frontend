import {
  MaterialTypeSchema,
  PlatformSchema,
} from '@/entities/material/api/http/material.primitives.schema';
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
 * Тип одного place DTO после валидации схемой.
 */
export type PlaceSummaryHttpDto = z.output<typeof PlaceSummaryHttpDtoSchema>;

/**
 * Тип ответа списка мест после валидации схемой.
 */
export type PlaceListResponseDto = z.output<typeof PlaceListResponseSchema>;

/**
 * Схема закрепленного материала внутри `GET /places/{placeId}`.
 */
export const MaterialPreviewHttpDtoSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  platform: PlatformSchema,
  type: MaterialTypeSchema,
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
 * Схема успешного payload детальной карточки места.
 */
export const PlaceDetailResponseSchema = PlaceSummaryHttpDtoSchema.extend({
  pinnedMaterial: MaterialPreviewHttpDtoSchema.nullable(),
  counters: PlaceCountersHttpDtoSchema,
});

/**
 * Тип закрепленного материала места после валидации схемой.
 */
export type MaterialPreviewHttpDto = z.output<typeof MaterialPreviewHttpDtoSchema>;

/**
 * Тип detail-ответа места после валидации схемой.
 */
export type PlaceDetailResponseDto = z.output<typeof PlaceDetailResponseSchema>;
