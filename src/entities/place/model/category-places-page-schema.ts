import { z } from 'zod';

/** Строгая клиентская схема страницы мест категории. */
export const categoryPlacesPageSchema = z.strictObject({
  items: z.array(
    z.strictObject({
      id: z.string().min(1),
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      title: z.string().min(1),
      coverImageUrl: z.string().nullable(),
    }),
  ),
  page: z.number().int().min(1).max(1000),
  pageSize: z.literal(20),
  total: z.number().int().nonnegative(),
});

/** Проверенная frontend-модель страницы мест категории. */
export type CategoryPlacesPage = z.infer<typeof categoryPlacesPageSchema>;
