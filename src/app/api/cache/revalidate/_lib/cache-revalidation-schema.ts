import { z } from 'zod';

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const cacheRevalidationPayloadSchema = z.strictObject({
  schemaVersion: z.literal(1),
  eventId: z.uuid(),
  occurredAt: z.iso.datetime({ offset: true }),
  scopes: z
    .strictObject({
      categories: z.literal(true).optional(),
      categorySlugs: z.array(slugSchema).min(1).optional(),
      placeSlugs: z.array(slugSchema).min(1).optional(),
    })
    .refine(
      (scopes) =>
        scopes.categories === true ||
        (scopes.categorySlugs?.length ?? 0) > 0 ||
        (scopes.placeSlugs?.length ?? 0) > 0,
      { message: 'At least one invalidation scope is required.' },
    ),
});

export type CacheRevalidationPayload = z.infer<typeof cacheRevalidationPayloadSchema>;
