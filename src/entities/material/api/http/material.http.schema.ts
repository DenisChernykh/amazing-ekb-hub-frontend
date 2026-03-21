import z from 'zod';

/**
 * Схема допустимых платформ материала в HTTP DTO.
 */
export const PlatformSchema = z.enum(['dzen', 'telegram', 'instagram']);

/**
 * Схема допустимых типов материала в HTTP DTO.
 */
export const MaterialTypeSchema = z.enum(['post', 'reel', 'video']);

/**
 * Схема одного материала из `GET /places/{placeId}/materials`.
 */
export const MaterialHttpDtoSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  platform: PlatformSchema,
  type: MaterialTypeSchema,
  title: z.string(),
  publishedAt: z.string(),
  durationSec: z.number().nullable().optional(),
  url: z.string(),
});
/**
 * Схема успешного payload списка материалов места.
 */
export const MaterialListResponseSchema = z.object({
  items: z.array(MaterialHttpDtoSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
});

/**
 * Тип одного материала после валидации схемой.
 */
export type MaterialHttpDto = z.output<typeof MaterialHttpDtoSchema>;

/**
 * Тип ответа списка материалов после валидации схемой.
 */
export type MaterialListResponseDto = z.output<typeof MaterialListResponseSchema>;
