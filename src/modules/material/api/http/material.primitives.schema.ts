import z from 'zod';

/**
 * Схема допустимых платформ материала в HTTP DTO.
 */
export const PlatformSchema = z.enum(['dzen', 'telegram', 'instagram']);

/**
 * Схема допустимых типов материала в HTTP DTO.
 */
export const MaterialTypeSchema = z.enum(['post', 'reel', 'video']);
